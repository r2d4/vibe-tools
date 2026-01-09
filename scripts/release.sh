#!/bin/bash
set -e

cd "$(dirname "$0")/.."

pnpm -r test

(cd go/cmd/claudesh && go test -v ./...)

npm version patch --no-git-tag-version

VERSION=$(node -p "require('./package.json').version")

pnpm -r exec npm pkg set version="$VERSION"

(cd go/cmd/claudesh && make release)

git add -A
git commit -m "v$VERSION"
git tag "v$VERSION"

pnpm -r publish

git push -u origin HEAD
git push --tags

gh release create "v$VERSION" \
  --generate-notes \
  build/claudesh-*
