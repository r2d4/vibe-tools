import { describe, it, expect, beforeEach } from "vitest";
import { Linter } from "eslint";
import removeAllComments from "../rules/remove-all-comments.mjs";

const PARSER_OPTIONS = { ecmaVersion: 2022, sourceType: "module" };

describe("JSDoc preservation", () => {
  let linter;

  beforeEach(() => {
    linter = new Linter({ configType: "eslintrc" });
    linter.defineRule("remove-all", removeAllComments);
  });

  describe("when preserveJSDoc is false (default)", () => {
    it("should remove JSDoc comments", () => {
      const code = `/**
 * This is a JSDoc comment
 * @param {string} name
 * @returns {string}
 */
function greet(name) {
  return 'Hello ' + name;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`function greet(name) {
  return 'Hello ' + name;
}`);
    });

    it("should remove single-line JSDoc comments", () => {
      const code = `/** Single line JSDoc */
function test() {}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`function test() {}`);
    });
  });

  describe("when preserveJSDoc is true", () => {
    it("should preserve JSDoc comments", () => {
      const code = `/**
 * This is a JSDoc comment
 * @param {string} name
 * @returns {string}
 */
function greet(name) {
  return 'Hello ' + name;
}`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preserveJSDoc: true }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve single-line JSDoc comments", () => {
      const code = `/** Single line JSDoc */
function test() {}`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preserveJSDoc: true }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve JSDoc with complex tags", () => {
      const code = `/**
 * @typedef {Object} User
 * @property {string} name - The user's name
 * @property {number} age - The user's age
 */
const user = { name: 'John', age: 30 };`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preserveJSDoc: true }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should still remove regular block comments", () => {
      const code = `/* Regular block comment */
function test() {}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preserveJSDoc: true }] },
      });
      expect(output.output).toBe(`function test() {}`);
    });

    it("should preserve JSDoc but remove regular comments", () => {
      const code = `/**
 * JSDoc comment
 */
function test() {
  // Regular comment
  return 1;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preserveJSDoc: true }] },
      });
      expect(output.output).toBe(`/**
 * JSDoc comment
 */
function test() {
  return 1;
}`);
    });

    it("should preserve multiple JSDoc comments", () => {
      const code = `/** First JSDoc */
function foo() {}

/** Second JSDoc */
function bar() {}`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preserveJSDoc: true }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve JSDoc on class members", () => {
      const code = `class MyClass {
  /**
   * Constructor
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Get name
   * @returns {string}
   */
  getName() {
    return this.name;
  }
}`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preserveJSDoc: true }] },
      });
      expect(messages).toHaveLength(0);
    });
  });
});
