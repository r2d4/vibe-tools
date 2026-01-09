package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestShebangStripping(t *testing.T) {
	content := "#!/some/path/claudesh\nactual prompt here"
	result := stripShebang(content)
	expected := "actual prompt here"
	if result != expected {
		t.Errorf("got %q, want %q", result, expected)
	}
}

func TestShebangStrippingNoShebang(t *testing.T) {
	content := "just a prompt\nwith multiple lines"
	result := stripShebang(content)
	if result != content {
		t.Errorf("got %q, want %q", result, content)
	}
}

func TestShebangStrippingWithFlags(t *testing.T) {
	content := "#!/path/to/claudesh --model opus\nthe prompt"
	result := stripShebang(content)
	expected := "the prompt"
	if result != expected {
		t.Errorf("got %q, want %q", result, expected)
	}
}

func TestNoArgs(t *testing.T) {
	bin := buildBinary(t)
	cmd := exec.Command(bin)
	err := cmd.Run()
	if err == nil {
		t.Error("expected error when no args provided")
	}
}

func TestMissingFile(t *testing.T) {
	bin := buildBinary(t)
	cmd := exec.Command(bin, "/nonexistent/file.prompt")
	err := cmd.Run()
	if err == nil {
		t.Error("expected error for missing file")
	}
}

func TestArgParsing(t *testing.T) {
	tests := []struct {
		name       string
		args       []string
		wantScript string
		wantFlags  []string
	}{
		{
			name:       "script only",
			args:       []string{"claudesh", "script.prompt"},
			wantScript: "script.prompt",
			wantFlags:  []string{},
		},
		{
			name:       "with model flag",
			args:       []string{"claudesh", "--model", "opus", "script.prompt"},
			wantScript: "script.prompt",
			wantFlags:  []string{"--model", "opus"},
		},
		{
			name:       "multiple flags",
			args:       []string{"claudesh", "--model", "opus", "--verbose", "script.prompt"},
			wantScript: "script.prompt",
			wantFlags:  []string{"--model", "opus", "--verbose"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			scriptPath := tt.args[len(tt.args)-1]
			flags := tt.args[1 : len(tt.args)-1]

			if scriptPath != tt.wantScript {
				t.Errorf("script: got %q, want %q", scriptPath, tt.wantScript)
			}
			if len(flags) != len(tt.wantFlags) {
				t.Errorf("flags length: got %d, want %d", len(flags), len(tt.wantFlags))
			}
			for i := range flags {
				if flags[i] != tt.wantFlags[i] {
					t.Errorf("flag[%d]: got %q, want %q", i, flags[i], tt.wantFlags[i])
				}
			}
		})
	}
}

func TestFlagsPassedToClaude(t *testing.T) {
	tmpdir := t.TempDir()

	mockClaude := filepath.Join(tmpdir, "claude")
	mockScript := `#!/bin/bash
echo "ARGS:$@"
`
	if err := writeFile(mockClaude, mockScript, 0755); err != nil {
		t.Fatal(err)
	}

	promptFile := filepath.Join(tmpdir, "test.prompt")
	if err := writeFile(promptFile, "#!/usr/bin/env claudesh\ntest prompt", 0644); err != nil {
		t.Fatal(err)
	}

	bin := buildBinary(t)

	tests := []struct {
		name     string
		flags    []string
		wantArgs string
	}{
		{
			name:     "no extra flags",
			flags:    []string{},
			wantArgs: "ARGS:-p",
		},
		{
			name:     "model flag",
			flags:    []string{"--model", "opus"},
			wantArgs: "ARGS:-p --model opus",
		},
		{
			name:     "multiple flags",
			flags:    []string{"--model", "opus", "--verbose"},
			wantArgs: "ARGS:-p --model opus --verbose",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			args := append(tt.flags, promptFile)
			cmd := exec.Command(bin, args...)
			cmd.Env = append(cmd.Environ(), "PATH="+tmpdir+":"+getPath())

			output, err := cmd.CombinedOutput()
			if err != nil {
				t.Fatalf("unexpected error: %v, output: %s", err, output)
			}

			got := strings.TrimSpace(string(output))
			if got != tt.wantArgs {
				t.Errorf("got %q, want %q", got, tt.wantArgs)
			}
		})
	}
}

func stripShebang(content string) string {
	lines := strings.Split(content, "\n")
	if len(lines) > 0 && strings.HasPrefix(lines[0], "#!") {
		lines = lines[1:]
	}
	return strings.Join(lines, "\n")
}

func writeFile(path, content string, perm os.FileMode) error {
	return os.WriteFile(path, []byte(content), perm)
}

func getPath() string {
	if p := os.Getenv("PATH"); p != "" {
		return p
	}
	return "/usr/bin:/bin"
}

func buildBinary(t *testing.T) string {
	t.Helper()
	tmpdir := t.TempDir()
	bin := filepath.Join(tmpdir, "claudesh")
	cmd := exec.Command("go", "build", "-o", bin, ".")
	if output, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("failed to build binary: %v\n%s", err, output)
	}
	return bin
}
