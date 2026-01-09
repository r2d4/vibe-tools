# claudesh

Shebang interpreter for Claude prompts.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/r2d4/vibe-tools/master/go/cmd/claudesh/install.md | claude
```

Via Go:
```bash
go install github.com/r2d4/vibe-tools/go/cmd/claudesh@latest
```

## Usage

```bash
#!/usr/bin/env claudesh
2 + 2 = ?
```

## Flags

Passed through to `claude -p`: `--model`, `--system-prompt`, `--output-format`, etc.

## How it works

Strips shebang, pipes rest to `claude -p`.
