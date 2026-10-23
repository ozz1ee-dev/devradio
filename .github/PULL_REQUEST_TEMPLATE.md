## Track submission

- Track ID:
- Title / artist:
- Licence:
- AI tool and plan:
- Audio URL (public HTTPS):

## Licence attestation (all boxes required)

- [ ] I own all rights in this recording and composition, or I created it.
- [ ] If this used Suno, it was generated while I was on a paid Pro or Premier plan at the time of generation, and I have the commercial rights Suno grants for that output.
- [ ] I am not a PRS/PPL (or other collective management organisation) member, and this track is not registered with any CMO.
- [ ] This track contains no samples, loops, or recordings of other people's work.
- [ ] The licence is CC BY 4.0, CC BY-SA 4.0, CC0 1.0, or my own Suno paid-plan output.
- [ ] I agree to the takedown procedure in `TAKEDOWN.md`.
- [ ] I accept 24/7 broadcast on the station, with attribution as supplied in `track.yaml`.
- [ ] I have disclosed the AI tool and plan used and have not submitted free-plan Suno output.

## Validation

- [ ] `track.yaml` validates against `schema/track.schema.json`.
- [ ] Audio is MP3 >= 192 kbps (CBR/VBR) or FLAC 44.1/48 kHz.
- [ ] Duration is 90-600 seconds.
- [ ] Loudness is -16 to -14 LUFS integrated (CI accepts -17 to -13) and true peak <= -1 dBTP.
- [ ] `audio.audio_url` is a public HTTPS link to the exact file and no audio is committed.
- [ ] `audio.sha256` matches the file at `audio.audio_url`.
- [ ] I ran `python scripts/validate.py tracks/<slug>/track.yaml` locally (or CI passed).
- [ ] The audio is not a duplicate of an existing track.

## Notes for reviewers

<!-- Optional: source/attribution notes, licence proof, or anything unusual. -->
