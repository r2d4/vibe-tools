#!/bin/bash
set -e

cd "$(dirname "$0")/../go/cmd/claudesh"

make test

make bump-patch

VERSION=$(make version)

make release

git add Makefile
git commit -m "claudesh v$VERSION"
git tag "claudesh-v$VERSION"

git push -u origin HEAD
git push --tags

gh release create "claudesh-v$VERSION" \
  --title "claudesh v$VERSION" \
  --generate-notes \
  ../../../build/claudesh-*
