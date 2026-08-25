#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}

name="${1:-}"
if [[ -z "$name" ]]; then
  echo "Usage: make note title=\"A short title\""
  exit 1
fi

date="$(date +%F)"
slug="${date}-$(slugify "$name")"
file="$ROOT/content/notes/${slug}.md"

if [[ -f "$file" ]]; then
  echo "Already exists: $file"
  exit 1
fi

cat > "$file" <<EOF
---
title: ${name}
date: ${date}
summary: One or two sentences that appear on the Notes list.
---

Write here in ordinary sentences. Use *italics* for scientific names, like *Episyrphus balteatus*.

- Bullet lists are fine
- Links look like [this](https://example.com)
EOF

echo "Created $file"
echo "Edit that file, then run: make preview"
