#!/usr/bin/env python3
"""Validate track submissions for the 24/7 lo-fi station.

Checks the YAML against schema/track.schema.json, downloads the audio from
audio.audio_url to a temp directory, verifies SHA-256, then checks licence,
audio format/bitrate, duration, loudness, duplicates and (optionally) AcoustID.
Audio is never stored in the repository or in object storage. Exits non-zero on
any hard failure. Warnings are reported but do not fail the run (AcoustID
matches are always warnings/needs-review).
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("ERROR: PyYAML is required (pip install pyyaml)")

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError:
    sys.exit("ERROR: jsonschema is required (pip install 'jsonschema[format]')")


LICENCES = {"CC-BY-4.0", "CC-BY-SA-4.0", "CC0-1.0", "SUNO-PAID-OWN"}
SUNO_PLANS = {"pro", "premier"}
MIN_DURATION = 90
MAX_DURATION = 600
# PROPOSAL: target -16..-14 LUFS integrated, accepted with 1 LU tolerance.
MIN_LUFS = -17.0
MAX_LUFS = -13.0
MAX_TRUE_PEAK = -1.0
MIN_MP3_BITRATE = 192_000
FLAC_SAMPLE_RATES = {44_100, 48_000}
FP_DUPLICATE = 0.90
FP_REVIEW = 0.75


class TrackError(Exception):
    pass


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    here = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description="Validate lo-fi radio track submissions.")
    parser.add_argument("paths", nargs="*", help="track.yaml files or track directories")
    parser.add_argument("--root", default=".", help="repository root (default: current directory)")
    parser.add_argument("--schema", default=str(here / "schema" / "track.schema.json"))
    parser.add_argument("--index", default=None, help="duplicate index (default: <root>/tracks/index.json)")
    parser.add_argument("--all", action="store_true", help="validate every tracks/*/track.yaml")
    parser.add_argument("--allow-missing-audio", action="store_true",
                        help="downgrade a failed audio_url download to a warning")
    parser.add_argument("--skip-fingerprint", action="store_true", help="skip Chromaprint duplicate checks")
    parser.add_argument("--skip-loudness", action="store_true", help="skip ffmpeg loudness measurement")
    parser.add_argument("--update-index", action="store_true",
                        help="rewrite tracks/index.json after a successful run")
    parser.add_argument("--schema-only", action="store_true",
                        help="check schema, folder, and licence rules only; do not download audio")
    parser.add_argument("--check-index", action="store_true",
                        help="validate tracks/index.json and exit (an empty tracks array is valid)")
    return parser.parse_args(argv)


def normalize(value):
    """PyYAML turns unquoted dates into date objects; schema wants strings."""
    if isinstance(value, dict):
        return {str(k): normalize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [normalize(v) for v in value]
    if isinstance(value, (dt.date, dt.datetime)):
        return value.isoformat()
    return value


def discover(paths: list[str], root: Path, validate_all: bool) -> list[Path]:
    found: list[Path] = []
    if validate_all or not paths:
        found.extend(sorted((root / "tracks").glob("*/track.yaml")))
    for raw in paths:
        candidate = Path(raw)
        if not candidate.exists():
            candidate = root / raw
        if candidate.is_dir():
            candidate = candidate / "track.yaml"
        if candidate.is_file():
            found.append(candidate)
        else:
            print(f"ERROR: no track.yaml at {raw}", file=sys.stderr)
            found.append(candidate)
    unique: list[Path] = []
    seen: set[Path] = set()
    for path in found:
        resolved = path.resolve()
        if resolved not in seen:
            seen.add(resolved)
            unique.append(path)
    return unique


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024


def download_audio(audio: dict) -> tuple[Path | None, str | None]:
    """Fetch audio.audio_url into a temp file (no secrets needed)."""
    import tempfile
    url = audio.get("audio_url")
    if not isinstance(url, str) or not url.startswith("https://"):
        return None, f"audio.audio_url must be an https URL: {url}"
    request = urllib.request.Request(
        url, headers={"User-Agent": "DevRadioValidator/1.0"}
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as resp:
            final = resp.geturl()
            if not isinstance(final, str) or not final.startswith("https://"):
                return None, f"audio_url redirected to a non-https URL: {final}"
            data = resp.read(MAX_DOWNLOAD_BYTES + 1)
    except Exception as exc:  # noqa: BLE001
        return None, f"could not download audio from {url}: {exc}"
    if len(data) > MAX_DOWNLOAD_BYTES:
        return None, f"audio_url file is larger than {MAX_DOWNLOAD_BYTES} bytes"
    suffix = f".{audio.get('format', 'audio')}"
    handle = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    handle.write(data)
    handle.close()
    return Path(handle.name), None


def resolve_audio(audio: dict) -> tuple[Path | None, str | None]:
    return download_audio(audio)


def run_json(cmd: list[str]) -> tuple[dict | None, str | None]:
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except FileNotFoundError:
        return None, f"command not found: {cmd[0]}"
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout).strip().splitlines()
        return None, detail[-1] if detail else f"{cmd[0]} exited {proc.returncode}"
    try:
        return json.loads(proc.stdout), None
    except json.JSONDecodeError as exc:
        return None, f"could not parse {cmd[0]} JSON: {exc}"


def probe_audio(path: Path) -> tuple[dict, dict]:
    data, error = run_json([
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", str(path),
    ])
    if error:
        raise TrackError(f"ffprobe failed: {error}")
    assert data is not None
    streams = [s for s in data.get("streams", []) if s.get("codec_type") == "audio"]
    if not streams:
        raise TrackError("ffprobe found no audio stream")
    return data, streams[0]


def check_audio_tech(audio: dict, path: Path, errors: list[str], warnings: list[str]) -> None:
    data, stream = probe_audio(path)
    fmt = data.get("format", {})
    names = {n.strip() for n in str(fmt.get("format_name", "")).split(",")}
    declared = audio.get("format")

    if declared == "mp3":
        if "mp3" not in names:
            errors.append(f"declared format mp3 but ffprobe sees {sorted(names)}")
        bitrate = stream.get("bit_rate") or fmt.get("bit_rate")
        try:
            bitrate_int = int(bitrate) if bitrate else 0
        except (TypeError, ValueError):
            bitrate_int = 0
        duration = float(fmt.get("duration") or stream.get("duration") or 0)
        if bitrate_int <= 0 and duration > 0:
            bitrate_int = int(path.stat().st_size * 8 / duration)
        if bitrate_int < MIN_MP3_BITRATE:
            errors.append(
                f"MP3 bitrate is {bitrate_int // 1000 or 'unknown'} kbps; "
                f"minimum is {MIN_MP3_BITRATE // 1000} kbps (CBR or VBR average)"
            )
    elif declared == "flac":
        if "flac" not in names:
            errors.append(f"declared format flac but ffprobe sees {sorted(names)}")
        sample_rate = int(stream.get("sample_rate") or 0)
        if sample_rate not in FLAC_SAMPLE_RATES:
            errors.append(
                f"FLAC sample rate is {sample_rate or 'unknown'} Hz; "
                "must be 44100 or 48000 Hz"
            )

    measured_duration = 0.0
    try:
        measured_duration = float(fmt.get("duration") or stream.get("duration") or 0)
    except (TypeError, ValueError):
        pass
    if measured_duration:
        if not (MIN_DURATION <= measured_duration <= MAX_DURATION):
            errors.append(
                f"duration is {measured_duration:.1f}s; must be {MIN_DURATION}..{MAX_DURATION}s"
            )
        declared_duration = int(audio.get("duration_sec") or 0)
        if abs(measured_duration - declared_duration) > 2:
            warnings.append(
                f"declared duration_sec={declared_duration} differs from measured "
                f"{measured_duration:.1f}s by more than 2s"
            )
    else:
        errors.append("could not determine audio duration")


def measure_loudness(path: Path, errors: list[str]) -> tuple[float, float] | None:
    cmd = [
        "ffmpeg", "-hide_banner", "-nostdin", "-nostats", "-i", str(path),
        "-af", "loudnorm=I=-14:TP=-1:print_format=json", "-f", "null", "-",
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except FileNotFoundError:
        errors.append("ffmpeg not found; cannot measure loudness")
        return None
    if proc.returncode != 0:
        errors.append(f"ffmpeg loudness measurement failed: {proc.stderr.strip().splitlines()[-1] if proc.stderr.strip() else proc.returncode}")
        return None
    blocks = re.findall(r"\{[^{}]*\}", proc.stderr, flags=re.DOTALL)
    if not blocks:
        errors.append("ffmpeg loudnorm produced no JSON summary")
        return None
    try:
        data = json.loads(blocks[-1])
        integrated = float(data["input_i"])
        true_peak = float(data["input_tp"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        errors.append(f"could not parse ffmpeg loudnorm output: {exc}")
        return None
    return integrated, true_peak


def fpcalc(path: Path, raw: bool) -> tuple[dict | None, str | None]:
    cmd = ["fpcalc"]
    if raw:
        cmd.append("-raw")
    cmd.extend(["-json", str(path)])
    return run_json(cmd)


def raw_fingerprint(path: Path, errors: list[str], warnings: list[str]) -> list[int] | None:
    data, error = fpcalc(path, raw=True)
    if error:
        errors.append(f"Chromaprint/fpcalc failed: {error}")
        return None
    assert data is not None
    value = data.get("fingerprint")
    if isinstance(value, list):
        return [int(v) for v in value]
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return [int(v) for v in parsed]
        except (json.JSONDecodeError, ValueError):
            pass
        decoded = decompress_chromaprint(value)
        if decoded:
            return decoded
    warnings.append("fpcalc returned no usable raw fingerprint")
    return None


def decompress_chromaprint(encoded: str) -> list[int] | None:
    """Decode Chromaprint's compressed fingerprint (best effort)."""
    try:
        data = base64.b64decode(encoded)
    except (ValueError, TypeError):
        return None
    if len(data) < 4:
        return None
    result: list[int] = []
    value = 0
    index = 4
    while index < len(data):
        delta = 0
        shift = 0
        while True:
            if index >= len(data):
                return result or None
            byte = data[index]
            index += 1
            delta |= (byte & 0x7F) << shift
            if not byte & 0x80:
                break
            shift += 7
        if delta & 1:
            value -= (delta + 1) // 2
        else:
            value += delta // 2
        result.append(value)
    return result or None


def fp_similarity(left: list[int], right: list[int]) -> float:
    if not left or not right:
        return 0.0
    if len(left) < 32 or len(right) < 32:
        a, b = set(left), set(right)
    else:
        a = {tuple(left[i:i + 32]) for i in range(len(left) - 31)}
        b = {tuple(right[i:i + 32]) for i in range(len(right) - 31)}
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def load_index(index_path: Path, warnings: list[str]) -> list[dict]:
    if not index_path.is_file():
        return []
    try:
        data = json.loads(index_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        warnings.append(f"could not read duplicate index {index_path}: {exc}")
        return []
    rows = data.get("tracks", []) if isinstance(data, dict) else data
    if not isinstance(rows, list):
        warnings.append(f"duplicate index {index_path} has an unexpected shape")
        return []
    entries = []
    for row in rows:
        if isinstance(row, dict) and row.get("sha256"):
            entries.append(dict(row))
    return entries


def existing_tracks(root: Path, index_path: Path,
                    warnings: list[str]) -> list[dict]:
    entries = load_index(index_path, warnings)
    indexed = {entry.get("id") for entry in entries if entry.get("id")}
    for path in sorted((root / "tracks").glob("*/track.yaml")):
        try:
            track = normalize(yaml.safe_load(path.read_text(encoding="utf-8")))
        except (OSError, yaml.YAMLError) as exc:
            warnings.append(f"could not read existing track {path}: {exc}")
            continue
        if not isinstance(track, dict) or not isinstance(track.get("audio"), dict):
            continue
        if track.get("id") in indexed:
            continue
        audio = track["audio"]
        audio_path, _ = resolve_audio(audio)
        entries.append({
            "id": track.get("id"),
            "sha256": audio.get("sha256"),
            "audio_url": audio.get("audio_url"),
            "fingerprint": None,
            "audio_path": audio_path,
            "yaml_path": path,
        })
    return entries


def check_duplicates(track: dict, path: Path, raw_fp: list[int] | None,
                     entries: list[dict], errors: list[str], warnings: list[str],
                     skip_fingerprint: bool) -> None:
    current_id = track.get("id")
    declared_sha = track["audio"]["sha256"].lower()
    reported_sha: set[str] = set()
    for entry in entries:
        entry_path = entry.get("yaml_path")
        if entry_path and Path(entry_path).resolve() == path.resolve():
            continue
        other_id = entry.get("id") or "unknown"
        if other_id == current_id:
            continue
        other_sha = str(entry.get("sha256") or "").lower()
        if other_sha and other_sha == declared_sha:
            if other_sha not in reported_sha:
                errors.append(f"duplicate audio: SHA-256 already used by track '{other_id}'")
                reported_sha.add(other_sha)
            continue
        if skip_fingerprint or not raw_fp:
            continue
        other_fp = entry.get("fingerprint")
        if not other_fp and entry.get("audio_path") and Path(entry["audio_path"]).is_file():
            data, fp_error = fpcalc(Path(entry["audio_path"]), raw=True)
            if not fp_error and data and isinstance(data.get("fingerprint"), list):
                other_fp = [int(v) for v in data["fingerprint"]]
                entry["fingerprint"] = other_fp
        if not isinstance(other_fp, list) or not other_fp:
            continue
        similarity = fp_similarity(raw_fp, [int(v) for v in other_fp])
        if similarity >= FP_DUPLICATE:
            errors.append(
                f"duplicate audio: Chromaprint similarity {similarity:.0%} with track "
                f"'{other_id}' (re-encode or remove the duplicate)"
            )
        elif similarity >= FP_REVIEW:
            warnings.append(
                f"possible duplicate of '{other_id}' (fingerprint similarity "
                f"{similarity:.0%}); needs-review"
            )


def check_acoustid(path: Path, errors: list[str], warnings: list[str]) -> None:
    api_key = os.environ.get("ACOUSTID_API_KEY", "").strip()
    if not api_key:
        return
    data, error = fpcalc(path, raw=False)
    if error or not data:
        warnings.append(f"AcoustID skipped: {error}")
        return
    fingerprint = data.get("fingerprint")
    duration = data.get("duration")
    if not fingerprint or not duration:
        warnings.append("AcoustID skipped: fpcalc returned no fingerprint/duration")
        return
    payload = urllib.parse.urlencode({
        "client": api_key,
        "meta": "recordings",
        "duration": int(float(duration)),
        "fingerprint": fingerprint,
    }).encode()
    request = urllib.request.Request(
        "https://api.acoustid.org/v2/lookup",
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        warnings.append(f"AcoustID lookup failed (needs-review manually): {exc}")
        return
    results = result.get("results") or []
    for item in results:
        for recording in item.get("recordings") or []:
            artists = ", ".join(a.get("name", "?") for a in recording.get("artists") or [])
            warnings.append(
                f"AcoustID match needs-review: {artists or 'unknown artist'} - "
                f"{recording.get('title') or 'unknown title'}"
            )
            return


def in_tracks_dir(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to((root / "tracks").resolve())
    except ValueError:
        return False
    return True


def validate_one(path: Path, validator, root: Path,
                 entries: list[dict], args: argparse.Namespace,
                 errors: list[str], warnings: list[str]) -> dict | None:
    label = str(path.resolve().relative_to(root)) if root in path.resolve().parents else str(path)
    print(f"\n== {label} ==")
    error_count = len(errors)
    if not path.is_file():
        errors.append(f"{label}: file does not exist")
        return None
    try:
        track = normalize(yaml.safe_load(path.read_text(encoding="utf-8")))
    except (OSError, yaml.YAMLError) as exc:
        errors.append(f"{label}: invalid YAML: {exc}")
        return None
    if not isinstance(track, dict):
        errors.append(f"{label}: YAML root must be a mapping")
        return None

    schema_errors = sorted(validator.iter_errors(track), key=lambda e: list(e.absolute_path))
    for schema_error in schema_errors:
        location = "/".join(str(part) for part in schema_error.absolute_path) or "<root>"
        errors.append(f"{label}: schema: {location}: {schema_error.message}")
    if schema_errors:
        return track

    track_id = track["id"]
    if in_tracks_dir(path, root) and path.parent.name != track_id:
        errors.append(
            f"{label}: folder must be tracks/{track_id}/ (found tracks/{path.parent.name}/)"
        )

    licence = track["licence"]
    if licence not in LICENCES:
        errors.append(f"{label}: licence '{licence}' is not in the allowlist: {sorted(LICENCES)}")
    ai_name = str(track["ai_tool"].get("name", "")).strip().lower()
    ai_plan = track["ai_tool"].get("plan")
    if licence == "SUNO-PAID-OWN" and ai_plan not in SUNO_PLANS:
        errors.append(f"{label}: SUNO-PAID-OWN requires ai_tool.plan pro or premier at generation time")
    if "suno" in ai_name and ai_plan not in SUNO_PLANS:
        errors.append(f"{label}: Suno output requires a paid pro/premier plan; free-plan output is not accepted")

    if args.schema_only:
        if len(errors) == error_count:
            print(f"   id={track_id} licence={licence} schema-only")
        return track

    audio = track["audio"]
    audio_path, missing_reason = resolve_audio(audio)
    if audio_path is None:
        message = f"{label}: {missing_reason}"
        if args.allow_missing_audio:
            warnings.append(message + " - AUDIO NOT VERIFIED")
            check_duplicates(track, path, None, entries, errors, warnings, True)
            return track
        errors.append(message)
        return track

    actual_sha = sha256_file(audio_path)
    if actual_sha != audio["sha256"].lower():
        errors.append(
            f"{label}: SHA-256 mismatch: track.yaml says {audio['sha256']}, "
            f"file is {actual_sha}"
        )

    try:
        check_audio_tech(audio, audio_path, errors, warnings)
    except TrackError as exc:
        errors.append(f"{label}: {exc}")

    if not args.skip_loudness:
        loudness = measure_loudness(audio_path, errors)
        if loudness:
            integrated, true_peak = loudness
            if not (MIN_LUFS <= integrated <= MAX_LUFS):
                errors.append(
                    f"{label}: integrated loudness {integrated:.1f} LUFS is outside "
                    f"{MIN_LUFS:.0f}..{MAX_LUFS:.0f} LUFS"
                )
            if true_peak > MAX_TRUE_PEAK:
                errors.append(
                    f"{label}: true peak {true_peak:.1f} dBTP exceeds "
                    f"{MAX_TRUE_PEAK:.0f} dBTP"
                )
            declared_lufs = audio.get("lufs_integrated")
            if declared_lufs is not None and abs(float(declared_lufs) - integrated) > 0.5:
                warnings.append(
                    f"{label}: declared lufs_integrated={declared_lufs} differs from "
                    f"measured {integrated:.1f} LUFS by more than 0.5"
                )

    raw_fp = None
    if not args.skip_fingerprint:
        raw_fp = raw_fingerprint(audio_path, errors, warnings)
    check_duplicates(track, path, raw_fp, entries, errors, warnings, args.skip_fingerprint)
    if not args.skip_fingerprint:
        check_acoustid(audio_path, errors, warnings)

    print(f"   id={track_id} licence={licence} audio={audio_path.name}")
    return track


def update_index(root: Path, index_path: Path, warnings: list[str]) -> None:
    rows = []
    for path in sorted((root / "tracks").glob("*/track.yaml")):
        try:
            track = normalize(yaml.safe_load(path.read_text(encoding="utf-8")))
        except (OSError, yaml.YAMLError) as exc:
            warnings.append(f"index: skipped {path}: {exc}")
            continue
        if not isinstance(track, dict) or not isinstance(track.get("audio"), dict):
            continue
        audio_path, _ = resolve_audio(track["audio"])
        if not audio_path:
            warnings.append(f"index: skipped {path}: audio could not be downloaded")
            continue
        raw_fp = None
        data, error = fpcalc(audio_path, raw=True)
        if not error and data and isinstance(data.get("fingerprint"), list):
            raw_fp = [int(v) for v in data["fingerprint"]]
        artist = track.get("artist") if isinstance(track.get("artist"), dict) else {}
        rows.append({
            "id": track.get("id"),
            "title": track.get("title"),
            "artist": artist.get("name"),
            "licence": track.get("licence"),
            "source_url": track.get("source_url"),
            "sha256": sha256_file(audio_path),
            "audio_url": track["audio"].get("audio_url"),
            "fingerprint": raw_fp,
        })
    index_path.parent.mkdir(parents=True, exist_ok=True)
    index_path.write_text(json.dumps({"tracks": rows}, indent=2) + "\n", encoding="utf-8")
    print(f"\nWrote import index: {index_path} ({len(rows)} track(s))")


SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SHA_RE = re.compile(r"^[a-f0-9]{64}$")


def check_index(index_path: Path) -> int:
    """Confirm tracks/index.json is an object with a tracks array.

    An empty array is valid. A row must include the fields the importer uses
    to fetch a file: id, sha256, and an https audio_url.
    """
    if not index_path.is_file():
        print(f"ERROR: index not found: {index_path}", file=sys.stderr)
        return 1
    try:
        data = json.loads(index_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: could not read index {index_path}: {exc}", file=sys.stderr)
        return 1
    rows = data.get("tracks") if isinstance(data, dict) else None
    if not isinstance(rows, list):
        print(f"ERROR: {index_path} must be an object with a tracks array", file=sys.stderr)
        return 1
    errors: list[str] = []
    for index, row in enumerate(rows):
        where = f"tracks[{index}]"
        if not isinstance(row, dict):
            errors.append(f"{where} is not an object")
            continue
        track_id = row.get("id")
        if not isinstance(track_id, str) or not SLUG_RE.match(track_id):
            errors.append(f"{where}.id must be a lower-case slug")
        digest = row.get("sha256")
        if not isinstance(digest, str) or not SHA_RE.match(digest):
            errors.append(f"{where}.sha256 must be 64 lower-case hex characters")
        url = row.get("audio_url")
        if not isinstance(url, str) or not url.startswith("https://"):
            errors.append(f"{where}.audio_url must be an https URL")
    if errors:
        print("\nErrors:")
        for error in errors:
            print(f"  ERROR: {error}")
        print(f"\nFAILED: {len(errors)} error(s) in {index_path}.")
        return 1
    print(f"OK: {index_path} lists {len(rows)} track(s).")
    return 0


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    root = Path(args.root).resolve()
    schema_path = Path(args.schema)
    if not schema_path.is_file():
        schema_path = root / "schema" / "track.schema.json"
    index_path = Path(args.index) if args.index else root / "tracks" / "index.json"

    if args.check_index:
        return check_index(index_path)

    try:
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: could not load schema {schema_path}: {exc}", file=sys.stderr)
        return 1
    validator = Draft202012Validator(schema, format_checker=FormatChecker())

    files = discover(args.paths, root, args.all)
    if not files:
        if args.paths and not args.all:
            print("ERROR: no track.yaml files to validate (pass paths or --all)", file=sys.stderr)
            return 1
        code = check_index(index_path)
        if code != 0:
            return code
        print("OK: no track.yaml files to validate.")
        return 0

    errors: list[str] = []
    warnings: list[str] = []
    entries: list[dict] = []
    if not args.schema_only:
        entries = existing_tracks(root, index_path, warnings)

    for path in files:
        validate_one(path, validator, root, entries, args, errors, warnings)

    if warnings:
        print("\nWarnings:")
        for warning in warnings:
            print(f"  WARN: {warning}")
    if errors:
        print("\nErrors:")
        for error in errors:
            print(f"  ERROR: {error}")
        print(f"\nFAILED: {len(errors)} error(s) in {len(files)} track(s).")
        return 1

    if args.update_index:
        update_index(root, index_path, warnings)

    print(f"\nOK: {len(files)} track(s) valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
