# Accepted licences and attribution

| `licence` value | Meaning | Commercial broadcast / 24-7 | Attribution |
| --- | --- | --- | --- |
| `CC-BY-4.0` | Creative Commons Attribution 4.0 | Allowed | Required |
| `CC-BY-SA-4.0` | Creative Commons Attribution-ShareAlike 4.0 | Allowed | Required; adaptations must use the same licence |
| `CC0-1.0` | Public domain dedication | Allowed | Not required, but kept when supplied |
| `SUNO-PAID-OWN` | Output generated on a paid Suno Pro or Premier plan, used under Suno's commercial terms | Allowed under those terms | Required by station policy |

Not accepted: CC BY-NC, CC BY-ND, all-rights-reserved, unknown licences, stream rips, and any
track registered with PRS/PPL or another collective management organisation (CMO). Do not submit
material containing third-party samples or loops.

## Attribution format

The n8n importer writes this comment into AzuraCast:

```
Artist - Title | Licence: <licence> | Source: <source_url> | AI: <name> (<plan>) | Artist: <artist_url>
```

For CC BY and CC BY-SA, the artist name, track title, licence name/URL, and source URL must remain
visible wherever the track is credited. For `SUNO-PAID-OWN`, the station credits the submitting
artist and links the generation URL.

## Suno paid-output rules

- The track must have been generated while the contributor was on the **Pro** or **Premier** plan
  at generation time. Free-plan output is not accepted.
- Keep `source_url`, `ai_tool.name`, and `ai_tool.plan` accurate; the schema rejects
  `SUNO-PAID-OWN` unless the plan is `pro` or `premier`.
- Suno's terms grant commercial usage rights on paid plans, but Suno does not guarantee copyright
  in the output. The station relies on those contractual rights, not on a copyright registration.
- Do not upload a Suno track that also contains samples or vocals from third-party material you do
  not control.

## CC BY-SA note

Broadcasting a track does not by itself create an adaptation. If you remix, edit, or otherwise
adapt a CC BY-SA track, the adaptation must be shared under CC BY-SA 4.0 and the attribution must
say it was changed.

## Contributor attestations

Every submission attests that:

- The contributor owns all rights or created the track.
- Suno output came from a paid Pro/Premier plan.
- The contributor is not a PRS/PPL (or other CMO) member and the track is not registered with a CMO.
- There are no third-party samples.
- The licence is one of the four accepted values.
- The contributor accepts the takedown procedure and 24/7 broadcast with attribution.

See [TAKEDOWN.md](TAKEDOWN.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
