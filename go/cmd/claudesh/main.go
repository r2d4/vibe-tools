package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

var version = "dev"

func run() error {
	if len(os.Args) < 2 {
		return fmt.Errorf("usage: claudesh [flags] <script>")
	}

	if os.Args[1] == "--version" || os.Args[1] == "-v" {
		fmt.Println(version)
		return nil
	}

	scriptPath := os.Args[len(os.Args)-1]
	claudeFlags := os.Args[1 : len(os.Args)-1]

	f, err := os.Open(scriptPath)
	if err != nil {
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	var lines []string
	first := true

	for scanner.Scan() {
		line := scanner.Text()
		if first {
			first = false
			if strings.HasPrefix(line, "#!") {
				continue
			}
		}
		lines = append(lines, line)
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	prompt := strings.Join(lines, "\n")

	args := append([]string{"-p"}, claudeFlags...)
	cmd := exec.Command("claude", args...)
	cmd.Stdin = strings.NewReader(prompt)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
