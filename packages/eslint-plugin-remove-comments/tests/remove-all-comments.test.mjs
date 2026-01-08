import { describe, it, expect, beforeEach } from "vitest";
import { Linter } from "eslint";
import removeAllComments from "../rules/remove-all-comments.mjs";

const PARSER_OPTIONS = { ecmaVersion: 2022, sourceType: "module" };

describe("remove-all-comments", () => {
  let linter;

  beforeEach(() => {
    linter = new Linter({ configType: "eslintrc" });
    linter.defineRule("remove-all", removeAllComments);
  });

  it("should have correct meta information", () => {
    expect(removeAllComments.meta.type).toBe("suggestion");
    expect(removeAllComments.meta.fixable).toBe("code");
  });

  describe("valid cases - should not report errors", () => {
    it("should allow code without comments", () => {
      const code = "const x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve eslint-disable comments", () => {
      const code = "// eslint-disable-next-line\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve eslint-enable comments", () => {
      const code = "/* eslint-enable */\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve comments in empty catch blocks", () => {
      const code = "try { throw new Error(); } catch (e) { /* empty */ }";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve custom patterns", () => {
      const code = "// Custom pattern\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePatterns: ["Custom pattern"] }] },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve @ts-ignore comments", () => {
      const code = "// @ts-ignore\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve @ts-expect-error comments", () => {
      const code = "// @ts-expect-error\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve @ts-nocheck comments", () => {
      const code = "// @ts-nocheck\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve @ts-check comments", () => {
      const code = "// @ts-check\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should preserve triple-slash reference directives", () => {
      const code = '/// <reference path="./types.d.ts" />\nconst x = 1;';
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });
  });

  describe("invalid cases - should report errors with fixes", () => {
    it("should remove single-line comments", () => {
      const code = "// This is a comment\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe("Remove comment");
      expect(messages[0].fix).toBeDefined();

      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe("const x = 1;");
    });

    it("should remove block comments", () => {
      const code = "/* This is a block comment */\nconst x = 1;";
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe("const x = 1;");
    });

    it("should remove inline comments", () => {
      const code = "const x = 1; // inline comment";
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe("const x = 1;");
    });

    it("should remove inline block comments", () => {
      const code = "const x = 1; /* inline block */";
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe("const x = 1;");
    });

    it("should remove multiline JSDoc comments", () => {
      const code = `/**
 * Multi-line JSDoc comment
 * @param {string} name
 */
function greet(name) {
  return 'Hello ' + name;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`function greet(name) {
  return 'Hello ' + name;
}`);
    });

    it("should remove comments in functions", () => {
      const code = `function test() {
  // Comment before code
  const x = 1;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`function test() {
  const x = 1;
}`);
    });

    it("should remove comments in objects", () => {
      const code = `const obj = {
  // Comment in object
  key: 'value'
};`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const obj = {
  key: 'value'
};`);
    });

    it("should remove comments in arrays", () => {
      const code = `const arr = [
  // Comment in array
  1, 2, 3
];`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const arr = [
  1, 2, 3
];`);
    });

    it("should remove comments in if blocks", () => {
      const code = `if (true) {
  // Comment in if block
  console.log('yes');
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`if (true) {
  console.log('yes');
}`);
    });

    it("should remove comments in non-empty catch blocks", () => {
      const code = "try { throw new Error(); } catch (e) { /* not empty */ console.log(e); }";
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe("try { throw new Error(); } catch (e) {console.log(e); }");
    });

    it("should remove multiple consecutive comments", () => {
      const code = `// Comment 1
// Comment 2
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should remove TODO comments", () => {
      const code = `// TODO: implement this
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should remove FIXME comments", () => {
      const code = `// FIXME: broken
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should handle comments with trailing spaces", () => {
      const code = `const x = 1; // Comment with spaces   `;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should handle multiple spaces before comment", () => {
      const code = `const x = 1;    // Multiple spaces before comment`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should remove only comment in empty block", () => {
      const code = `function test() {
  /* Only comment in block */
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`function test() {}`);
    });
  });

  describe("edge cases", () => {
    it("should handle comments with newlines correctly", () => {
      const code = `const x = 1; // comment
const y = 2;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;
const y = 2;`);
    });

    it("should not break code structure", () => {
      const code = `const x = 1;
// comment
const y = 2;
// another comment
const z = 3;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;
const y = 2;
const z = 3;`);
    });

    it("should preserve eslint-disable-line comments", () => {
      const code = "const x = 1; // eslint-disable-line no-unused-vars";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should handle comments at end of file", () => {
      const code = `const x = 1;
// End of file comment`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;\n`);
    });

    it("should handle comments at start of file", () => {
      const code = `// Start of file comment
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should handle multiline block comments with asterisks", () => {
      const code = `/*
       * Comment with
       * asterisks on each line
       */
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should handle multiple custom preserve patterns", () => {
      const code = `// Pattern 1
// Pattern 2
// Remove this
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePatterns: ["Pattern 1", "Pattern 2"] }] },
      });
      expect(output.output).toBe(`// Pattern 1
// Pattern 2
const x = 1;`);
    });

    it("should handle regex in preserve patterns", () => {
      const code = `// KEEP: important note
// Remove this
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": ["error", { preservePatterns: ["^KEEP:"] }] },
      });
      expect(output.output).toBe(`// KEEP: important note
const x = 1;`);
    });

    it("should handle empty catch with line comment", () => {
      const code = "try { throw new Error(); } catch (e) { // empty\n}";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should handle catch block with only whitespace and comment", () => {
      const code = `try {
  throw new Error();
} catch (e) {
  // empty
}`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should remove comments between array elements", () => {
      const code = `const arr = [
  1,
  // comment
  2,
  /* another */
  3
];`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const arr = [
  1,
  2,
  3
];`);
    });

    it("should remove comments between object properties", () => {
      const code = `const obj = {
  a: 1,
  // comment
  b: 2,
  /* another */
  c: 3
};`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const obj = {
  a: 1,
  b: 2,
  c: 3
};`);
    });

    it("should handle comments in arrow functions", () => {
      const code = `const fn = () => {
  // comment
  return 1;
};`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const fn = () => {
  return 1;
};`);
    });

    it("should handle comments in class methods", () => {
      const code = `class MyClass {
  myMethod() {
    // comment
    return 1;
  }
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`class MyClass {
  myMethod() {
    return 1;
  }
}`);
    });

    it("should preserve multiple eslint directives", () => {
      const code = `// eslint-disable no-console
// eslint-disable no-unused-vars
const x = 1;`;
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should handle mixed eslint and regular comments", () => {
      const code = `// eslint-disable
// This is a regular comment
const x = 1;
// eslint-enable`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`// eslint-disable
const x = 1;
// eslint-enable`);
    });

    it("should handle comments with special characters", () => {
      const code = `// Comment with émojis 🎉 and spëcial çhars
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should handle very long comments", () => {
      const longComment = "// " + "a".repeat(1000);
      const code = `${longComment}\nconst x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should handle comments with tabs", () => {
      const code = `\t// Comment with tab before\nconst x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should preserve @ts- directives in block comments", () => {
      const code = "/* @ts-ignore */\nconst x = 1;";
      const messages = linter.verify(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(messages).toHaveLength(0);
    });

    it("should handle switch statements with comments", () => {
      const code = `switch (x) {
  case 1:
    // comment in case
    break;
  // comment between cases
  case 2:
    break;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`switch (x) {
  case 1:
    break;
  case 2:
    break;
}`);
    });

    it("should handle for loops with comments", () => {
      const code = `for (let i = 0; i < 10; i++) {
  // comment in loop
  console.log(i);
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`for (let i = 0; i < 10; i++) {
  console.log(i);
}`);
    });

    it("should handle while loops with comments", () => {
      const code = `while (true) {
  // comment in while
  break;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`while (true) {
  break;
}`);
    });

    it("should handle ternary expressions with comments", () => {
      const code = `const x = condition
  // comment in ternary
  ? value1
  : value2;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = condition
  ? value1
  : value2;`);
    });

    it("should not affect regex patterns that look like comments", () => {
      const code = `const regex = /\\/\\//g;
// This is a real comment
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const regex = /\\/\\//g;
const x = 1;`);
    });

    it("should handle template literals with embedded expressions", () => {
      const code = `const str = \`Hello \${
  // comment in template
  name
}\`;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const str = \`Hello \${
  name
}\`;`);
    });

    it("should handle async/await with comments", () => {
      const code = `async function test() {
  // comment before await
  const result = await fetch();
  return result;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`async function test() {
  const result = await fetch();
  return result;
}`);
    });

    it("should handle generators with comments", () => {
      const code = `function* generator() {
  // comment before yield
  yield 1;
  yield 2;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`function* generator() {
  yield 1;
  yield 2;
}`);
    });

    it("should handle destructuring with comments", () => {
      const code = `const {
  // comment in destructuring
  a,
  b
} = obj;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS, rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const {
  a,
  b
} = obj;`);
    });
  });
});
