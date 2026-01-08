import { describe, it, expect, beforeEach } from "vitest";
import { Linter } from "eslint";
import removeAllComments from "../rules/remove-all-comments.mjs";

const PARSER_OPTIONS = { ecmaVersion: 2022, sourceType: "module" };

describe("prefix preservation", () => {
  let linter;

  beforeEach(() => {
    linter = new Linter({ configType: "eslintrc" });
    linter.defineRule("remove-all", removeAllComments);
  });

  describe("when preservePrefix is not set (default)", () => {
    it("should remove TODO comments", () => {
      const code = `// TODO: implement this
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should remove FIXME comments", () => {
      const code = `// FIXME: broken
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });
  });

  describe("when preservePrefix is set", () => {
    it("should preserve TODO comments", () => {
      const code = `// TODO: implement this feature
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["TODO"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve FIXME comments", () => {
      const code = `// FIXME: this is broken
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["FIXME"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve NOTE comments", () => {
      const code = `// NOTE: important information
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["NOTE"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve HACK comments", () => {
      const code = `// HACK: temporary workaround
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["HACK"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve XXX comments", () => {
      const code = `// XXX: needs attention
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["XXX"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve TODO in block comments", () => {
      const code = `/* TODO: do something */
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["TODO"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should be case insensitive", () => {
      const code = `// todo: lowercase
// Todo: capitalized
// tOdO: mixed case
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["TODO"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should require colon after keyword", () => {
      const code = `// TODO no colon
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["TODO"] }] },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should preserve multiple prefix types", () => {
      const code = `// TODO: first item
// FIXME: second item
// NOTE: third item
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["TODO", "FIXME", "NOTE"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should remove regular comments but preserve specified prefixes", () => {
      const code = `// Regular comment
// TODO: important task
// Another regular comment
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["TODO"] }] },
      });
      expect(output.output).toBe(`// TODO: important task
const x = 1;`);
    });

    it("should only preserve specified prefixes", () => {
      const code = `// TODO: keep this
// FIXME: remove this
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["TODO"] }] },
      });
      expect(output.output).toBe(`// TODO: keep this
const x = 1;`);
    });

    it("should support custom prefixes", () => {
      const code = `// WARN: custom warning
// REVIEW: needs review
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["WARN", "REVIEW"] }] },
      });
      expect(messages).toHaveLength(0);
    });
  });

  describe("combining with other options", () => {
    it("should work with preserveJSDoc", () => {
      const code = `/**
 * JSDoc comment
 */
// TODO: implement this
function test() {
  // Regular comment
  return 1;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preserveJSDoc: true, preservePrefix: ["TODO"] }] },
      });
      expect(output.output).toBe(`/**
 * JSDoc comment
 */
// TODO: implement this
function test() {
  return 1;
}`);
    });

    it("should work with custom preserve patterns", () => {
      const code = `// KEEP: custom pattern
// TODO: task
// Regular comment
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePrefix: ["TODO"], preservePatterns: ["^KEEP:"] }] },
      });
      expect(output.output).toBe(`// KEEP: custom pattern
// TODO: task
const x = 1;`);
    });
  });
});
