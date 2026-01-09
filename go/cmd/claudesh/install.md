Download and install claudesh to /usr/local/bin.

Detect the OS and architecture, then download the correct binary from:
https://github.com/r2d4/vibe-tools/releases/latest/download/claudesh-{os}-{arch}

Where:
- os: darwin (macOS) or linux
- arch: arm64 (Apple Silicon, aarch64) or amd64 (Intel, x86_64)

Make it executable and move to /usr/local/bin (use sudo if needed).

If the go toolchain is installed, you can install claudesh with:
```bash
go install github.com/r2d4/vibe-tools/go/cmd/claudesh@latest
```

Otherwise, you can download the binary from the releases page.

Verify the installation works with:
```bash
claudesh --version
```