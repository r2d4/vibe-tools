# Install claudesh

```bash
mkdir -p ~/.local/bin
curl -fsSL -o ~/.local/bin/claudesh \
  https://github.com/r2d4/vibe-tools/releases/latest/download/claudesh-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/')
chmod +x ~/.local/bin/claudesh
```

Ensure `~/.local/bin` is in your PATH (add to `~/.zshrc` or `~/.bashrc`):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Verify:

```bash
claudesh --version
```
