# Contributing a track

This repository feeds a 24/7 lo-fi internet radio station running on our playout server. By opening a PR
you confirm the licence attestation in the pull request template and agree to the
[takedown procedure](TAKEDOWN.md).

## Before you start

Accepted licences:

- `CC-BY-4.0` - attribution required.
- `CC-BY-SA-4.0` - attribution and share-alike.
- `CC0-1.0` - public domain dedication.
- `SUNO-PAID-OWN` - your own output generated on a paid Suno Pro or Premier plan.

Not accepted: CC BY-NC, CC BY-ND, all-rights-reserved material, stream rips, Spotify/YouTube
recordings, free-plan Suno output, tracks registered with PRS/PPL or another CMO, or anything
containing third-party samples. If you are a PRS/PPL member, do not submit your own recordings;
the station cannot clear your CMO registration.

Suno note: paid plans grant commercial usage rights under Suno's terms, but Suno does not
guarantee copyright in the output. Keep the generation URL and the plan you used. Do not claim
copyright you do not have.

See [LICENSES.md](LICENSES.md) for attribution wording.

## 1. Fork and branch

Fork the repository and create a branch, for example `track/my-track-slug`. Use a lower-case slug
containing letters, digits and hyphens only.

## 2. Add the track folder

Copy [`examples/track.yaml`](examples/track.yaml) to `tracks/<slug>/track.yaml` and fill it in.
The folder name must equal `id`.

Every submission needs:

- Correct `artist`, `source_url`, `licence`, and `ai_tool` (use `{name: none, plan: none}` for
  non-AI tracks).
- `prs_member: false`, `ppl_member: false`, `contains_third_party_samples: false`.
- A completed `attestation` with your GitHub username and the date (`YYYY-MM-DD`).
- `audio.audio_url` with a public HTTPS link to the exact audio file.
- `audio.sha256` for that exact file.

## 3. Publish the audio and add its URL

Audio files are **not** committed to this repository. They live at the public URL you provide and,
after import, on the station's server.

1. Upload the audio to a public HTTPS location you control, for example a GitHub Release asset on
   your fork or your own web server.
2. Set `audio.audio_url` to the exact public HTTPS URL.
3. Set `audio.sha256` to the checksum of that file.
4. Keep the URL available while the PR is reviewed. CI downloads the file from this URL, so a
   private, expiring, or removed link will fail validation. The URL must remain available until
   the post-merge importer has fetched the track.

Compute the checksum:

```bash
sha256sum /path/to/<slug>.mp3
# macOS: shasum -a 256 /path/to/<slug>.mp3
```

## 4. Audio requirements

- MP3 at **>= 192 kbps** CBR or VBR (average), or FLAC at **44.1 or 48 kHz**.
- Duration **90-600 seconds**.
- Integrated loudness **-16 to -14 LUFS** (proposal; CI accepts -17 to -13), true peak **<= -1 dBTP**.
- No clipping, no long silence at the start/end, no spoken IDs or ads.
- One track per file. Instrumental or with cleared vocals only.

Check loudness with ffmpeg:

```bash
ffmpeg -hide_banner -nostats -i input.mp3 \
  -af loudnorm=I=-14:TP=-1:print_format=json -f null -
```

Look for `input_i` (integrated LUFS) and `input_tp` (true peak) in the JSON summary. If outside
the range, adjust the master and re-export rather than normalising aggressively.

## 5. Validate locally

Install the tools:

```bash
sudo apt-get install ffmpeg libchromaprint-tools
python -m pip install "jsonschema[format]" pyyaml
```

Run:

```bash
python scripts/validate.py tracks/<slug>/track.yaml
```

The script downloads the audio from `audio.audio_url`, verifies `audio.sha256`, and reports schema,
licence, format/bitrate, duration, loudness, SHA-256, duplicate and optional AcoustID findings with
explicit error messages. Fix hard errors before opening the PR.

## 6. Open a pull request

Fill in `.github/PULL_REQUEST_TEMPLATE.md` and tick every attestation box. CI validates only the
changed `tracks/*/track.yaml` files. A maintainer reviews licence and audio; merge triggers the
n8n import on the owner's home server.

## Review and merge

- CI must pass. AcoustID matches are warnings marked `needs-review`; a maintainer checks them.
- Do not add secrets, workflow changes, or unrelated files to a track PR.
- Maintainers may ask for a different master, a shorter edit, or proof of licence.
- After merge, the n8n workflow in the **devradio** folder polls `tracks/index.json`, downloads
  the new audio, verifies its sha256, and uploads it to the station's media folder. GitHub
  does not contact the playout server and holds no playout or SFTP secrets.

## Takedown summary

If you believe a track infringes your rights, follow [TAKEDOWN.md](TAKEDOWN.md). Verified claims
lead to removal from the repository and the station playlist, normally within 5 business days
(sooner if urgent). Do not open a normal track PR to dispute a takedown; use the takedown process.

## Questions

Open a discussion/issue without attaching copyrighted audio, or contact the maintainers listed in
`TAKEDOWN.md`.
