#!/bin/bash
set -e

cd "$(dirname "$0")/.."

# Test first
pnpm -r test

# Bump root version (source of truth)
npm version patch --no-git-tag-version

# Get the new version
VERSION=$(node -p "require('./package.json').version")

# Sync version to all packages
pnpm -r exec npm pkg set version="$VERSION"

# Commit and tag
git add -A
git commit -m "v$VERSION"
git tag "v$VERSION"

# Publish to npm
pnpm -r publish

# Push commits and tags
git push -u origin HEAD
git push --tags

# Create GitHub release
gh release create "v$VERSION" --generate-notes
