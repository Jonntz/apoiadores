#!/bin/bash
# Converts the Neo Sans Std OTFs into subset WOFF2 files served from public/fonts.
#
# Requires: pip install fonttools brotli
# Run only when the typeface changes — the output is committed.
#
#   bash scripts/build-fonts.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/neo-sans-std"
OUT="$ROOT/public/fonts"
mkdir -p "$OUT"

# Basic Latin + Latin-1 accents (pt-BR) + typographic punctuation. Deliberately
# broader than the current copy so future edits never hit a missing glyph.
UNI="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122"

sub () { # $1=source otf  $2=output name  $3=unicode ranges
  pyftsubset "$SRC/$1" \
    --output-file="$OUT/$2.woff2" \
    --flavor=woff2 \
    --layout-features='kern,liga,clig,calt' \
    --unicodes="$3" \
    --desubroutinize \
    --drop-tables+=DSIG \
    --no-hinting 2>/dev/null
  printf '%-28s %6s bytes\n' "$2.woff2" "$(wc -c < "$OUT/$2.woff2" | tr -d ' ')"
}

sub "Neo Sans Std Regular.otf" "neo-sans-400" "$UNI"
sub "Neo Sans Std Medium.otf"  "neo-sans-500" "$UNI"
sub "Neo Sans Std Bold.otf"    "neo-sans-700" "$UNI"
sub "Neo Sans Std Black.otf"   "neo-sans-900" "$UNI"

# Wordmark only: the glyphs in "MATHEUS BIANCARDINE", nothing else.
sub "Neo Sans Std Black Italic.otf" "neo-sans-900-italic" \
  "U+0020,U+0041,U+0042,U+0043,U+0044,U+0045,U+0048,U+0049,U+004D,U+004E,U+0052,U+0053,U+0054,U+0055"

echo "---"
du -ch "$OUT"/*.woff2 | tail -1
