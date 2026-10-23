# Importing tracks with n8n

Audio files are **not** stored in this repository. The only copy of the broadcast library is the
media folder on the AzuraCast station. GitHub Actions validates a submission, but after merge
GitHub does not contact AzuraCast and holds no AzuraCast or SFTP secrets.

The import runs from the owner's n8n instance on the home server, in the folder **devradio**.
n8n pulls the public metadata index, downloads the audio itself, verifies the checksum, and uploads
the file to AzuraCast.

## Inputs

- `tracks/index.json` on the repository's default branch. Each entry contains `id`, `title`,
  `artist`, `licence`, `source_url`, `sha256`, `audio_url`, and `fingerprint`.
- `audio_url` is a public HTTPS link to the exact audio file. It must stay available until the
  import has completed.
- A maintainer regenerates the index with `python scripts/validate.py --all --update-index` and
  commits it with the accepted track metadata.

## Where the secrets live

- AzuraCast API keys, SFTP usernames, host keys, and passwords exist **only** in n8n credentials
  (for example an "AzuraCast API" HTTP-header credential and an "SFTP" credential).
- Do not add these values to GitHub Actions secrets, workflow files, `tracks/index.json`, or any
  `track.yaml`.
- Back up the n8n instance and its encryption key separately from the station so the credentials
  can be recovered.

## Workflow logic

1. **Schedule trigger** (for example every 15 minutes) or a manual trigger for testing.
2. **Fetch the index** from
   `https://raw.githubusercontent.com/<owner>/<repo>/<default-branch>/tracks/index.json`
   (or use a GitHub node). Treat a failed or malformed fetch as a no-op and retry later.
3. **Loop over `tracks[]`.** Deduplicate by `sha256`:
   - Read the processed checksums from n8n static data (a small persistent store in n8n) or a
     local state file on the home server.
   - Skip the entry if its `sha256` has already been processed successfully.
   - Optionally also list the AzuraCast media folder and skip a path that already exists.
4. **Download** `audio_url` to a temporary directory on the n8n host. Only HTTPS is allowed.
5. **Verify** the downloaded file's SHA-256 against the index value. On mismatch, discard the file,
   leave the checksum out of the processed state, and alert. Do not upload.
6. **Upload to AzuraCast**, using one of these two routes:
   - **SFTP:** write the file into the station media folder as
     `<prefix>/<id>/<id>.<ext>` (for example `lofi/<id>/<id>.mp3`). Prefer uploading to a temporary
     name and renaming it into place so a partial file is never picked up by the station.
   - **AzuraCast API:** upload with
     `POST /api/station/{station_id}/files` (`path`, base64 `file`), then set title, artist, and
     the attribution comment with `PUT /api/station/{station_id}/file/{id}`. Confirm the fields
     against the installed AzuraCast version before enabling the workflow.
7. **Verify the upload** by listing the media folder or fetching the uploaded media item. Only
   after this succeeds, add the `sha256` to the processed state.
8. **Log and retry** failures with backoff. A failed import must not mark the track as done, so the
   next run retries it.

The workflow is safe to run repeatedly: an entry whose checksum is already in the processed state
is skipped, and an existing media path can be treated as already imported.

## Deduplication and attribution

- `sha256` is the identity of the audio. It is used both by CI (including `tracks/index.json`) and
  by n8n. Do not use the track `id` alone for deduplication.
- Use `title`, `artist`, `licence`, and `source_url` from the index for AzuraCast metadata and for
  the attribution comment described in [LICENSES.md](../LICENSES.md).
- If the same checksum appears under a different `id`, skip it and report it for manual review.

## Backup warning

Because the audio is no longer in Git or any separate object store, the AzuraCast station media
folder is the **single copy** of the library. Back it up on a schedule (for example filesystem
snapshots plus an encrypted copy on separate hardware or offsite storage) and test restores. The
n8n processed-checksum state is only an import journal; it is not a backup of the audio.

## Takedown

For a verified takedown, remove the media from AzuraCast and remove or disable the matching
`tracks/<slug>/` metadata in the repository. Do not rely on the n8n state to remove files
automatically. See [TAKEDOWN.md](../TAKEDOWN.md).
