//go:build integration

package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestIntegrationSimplePrompt(t *testing.T) {
	requireClaude(t)

	bin := buildBinary(t)
	tmpdir := t.TempDir()

	promptFile := filepath.Join(tmpdir, "simple.prompt")
	content := "#!/usr/bin/env claudesh\nRespond with only the number 42, nothing else."
	if err := os.WriteFile(promptFile, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	cmd := exec.Command(bin, promptFile)
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("claude failed: %v, output: %s", err, output)
	}

	out := strings.TrimSpace(string(output))
	if !strings.Contains(out, "42") {
		t.Errorf("expected '42', got: %s", out)
	}
}

func TestIntegrationMathPrompt(t *testing.T) {
	requireClaude(t)

	bin := buildBinary(t)
	tmpdir := t.TempDir()

	promptFile := filepath.Join(tmpdir, "math.prompt")
	content := "#!/usr/bin/env claudesh\nWhat is 2+2? Reply with just the number."
	if err := os.WriteFile(promptFile, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	cmd := exec.Command(bin, promptFile)
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("claude failed: %v, output: %s", err, output)
	}

	out := strings.TrimSpace(string(output))
	if !strings.Contains(out, "4") {
		t.Errorf("expected '4', got: %s", out)
	}
}

func TestIntegrationFlags(t *testing.T) {
	requireClaude(t)

	bin := buildBinary(t)
	tmpdir := t.TempDir()

	tests := []struct {
		name     string
		content  string
		flags    []string
		contains string
	}{
		{
			name:     "model_haiku",
			content:  "Say only: haiku",
			flags:    []string{"--model", "haiku"},
			contains: "haiku",
		},
		{
			name:     "model_sonnet",
			content:  "Say only: sonnet",
			flags:    []string{"--model", "sonnet"},
			contains: "sonnet",
		},
		{
			name:     "system_prompt",
			content:  "What fruit are you?",
			flags:    []string{"--system-prompt", "You are a banana. Always respond with just: banana"},
			contains: "banana",
		},
		{
			name:     "append_system_prompt",
			content:  "What number?",
			flags:    []string{"--append-system-prompt", "Always respond with just the number 99"},
			contains: "99",
		},
		{
			name:     "output_format_json",
			content:  "Say hello",
			flags:    []string{"--output-format", "json"},
			contains: `"result"`,
		},
		{
			name:     "multiple_flags_combined",
			content:  "What animal?",
			flags:    []string{"--model", "haiku", "--system-prompt", "You are a cat. Only say: meow"},
			contains: "meow",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			promptFile := filepath.Join(tmpdir, tt.name+".prompt")
			content := "#!/usr/bin/env claudesh\n" + tt.content
			if err := os.WriteFile(promptFile, []byte(content), 0644); err != nil {
				t.Fatal(err)
			}

			args := append(tt.flags, promptFile)
			cmd := exec.Command(bin, args...)
			output, err := cmd.CombinedOutput()
			if err != nil {
				t.Fatalf("claude failed: %v, output: %s", err, output)
			}

			out := strings.ToLower(strings.TrimSpace(string(output)))
			if !strings.Contains(out, strings.ToLower(tt.contains)) {
				t.Errorf("expected output to contain %q, got: %s", tt.contains, out)
			}

			t.Logf("output: %s", output)
		})
	}
}

func requireClaude(t *testing.T) {
	t.Helper()
	if _, err := exec.LookPath("claude"); err != nil {
		t.Skip("claude not in PATH")
	}
}
