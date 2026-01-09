Download and install claudesh to /usr/local/bin.

Detect the OS and architecture, then download the correct binary from:
https://github.com/r2d4/vibe-tools/releases/latest/download/claudesh-{os}-{arch}

Where:
- os: darwin (macOS) or linux
- arch: arm64 (Apple Silicon, aarch64) or amd64 (Intel, x86_64)

Rename the binary to `claudesh` (strip the OS and architecture suffix).
Make it executable and move to /usr/local/bin (use sudo if needed).

Verify the installation works with:
```bash
claudesh --version
```
