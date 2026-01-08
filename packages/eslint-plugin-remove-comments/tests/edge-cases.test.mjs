import { describe, it, expect, beforeEach } from "vitest";
import { Linter } from "eslint";
import removeAllComments from "../rules/remove-all-comments.mjs";

const PARSER_OPTIONS = { ecmaVersion: 2022, sourceType: "module" };

describe("Edge cases and complex scenarios", () => {
  let linter;

  beforeEach(() => {
    linter = new Linter({ configType: "eslintrc" });
    linter.defineRule("remove-all", removeAllComments);
  });

  describe("whitespace and formatting", () => {
    it("should preserve code formatting when removing comments", () => {
      const code = `const obj = {
  // comment
  a: 1,
  // another comment
  b: 2
};`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const obj = {
  a: 1,
  b: 2
};`);
    });

    it("should handle Windows-style line endings", () => {
      const code = "// comment\r\nconst x = 1;\r\n";
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toContain("const x = 1;");
    });

    it("should handle mixed indentation (tabs and spaces)", () => {
      const code = `function test() {
\t// tab comment
  \t// mixed comment
    // space comment
\treturn 1;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`function test() {
\treturn 1;
}`);
    });

    it("should handle multiple consecutive blank lines with comments", () => {
      const code = `const x = 1;


// comment with blank lines


const y = 2;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      // The comment removal preserves the blank lines structure
      expect(output.output).toBe(`const x = 1;




const y = 2;`);
    });
  });

  describe("string and regex edge cases", () => {
    it("should not confuse strings containing comment-like text", () => {
      const code = `const str = "// not a comment";
const str2 = '/* also not a comment */';
// This is a real comment
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const str = "// not a comment";
const str2 = '/* also not a comment */';
const x = 1;`);
    });

    it("should handle regex with comment-like patterns", () => {
      const code = `const regex1 = /\\/\\//;  // Match double slash
const regex2 = /\\/\\*/;  // Match slash star
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const regex1 = /\\/\\//;
const regex2 = /\\/\\*/;
const x = 1;`);
    });

    it("should handle template literals with comment-like text", () => {
      const code = `const str = \`
  // This looks like a comment but isn't
  /* Neither is this */
\`;
// Real comment
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toContain("// This looks like a comment but isn't");
      expect(output.output).toContain("const x = 1;");
    });
  });

  describe("nested structures", () => {
    it("should handle deeply nested objects with comments", () => {
      const code = `const obj = {
  level1: {
    // comment 1
    level2: {
      // comment 2
      level3: {
        // comment 3
        value: 1
      }
    }
  }
};`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const obj = {
  level1: {
    level2: {
      level3: {
        value: 1
      }
    }
  }
};`);
    });

    it("should handle nested functions with comments", () => {
      const code = `function outer() {
  // outer comment
  function inner() {
    // inner comment
    function deepest() {
      // deepest comment
      return 1;
    }
    return deepest();
  }
  return inner();
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`function outer() {
  function inner() {
    function deepest() {
      return 1;
    }
    return deepest();
  }
  return inner();
}`);
    });
  });

  describe("control flow comments", () => {
    it("should handle comments in try-catch-finally", () => {
      const code = `try {
  // try comment
  riskyOperation();
} catch (err) {
  // catch comment
  handleError(err);
} finally {
  // finally comment
  cleanup();
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`try {
  riskyOperation();
} catch (err) {
  handleError(err);
} finally {
  cleanup();
}`);
    });

    it("should preserve comments in empty catch but remove in non-empty finally", () => {
      const code = `try {
  riskyOperation();
} catch (err) {
  // ignore
} finally {
  // finally comment
  cleanup();
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toContain("// ignore");
      expect(output.output).not.toContain("// finally comment");
    });

    it("should handle comments in switch with fallthrough", () => {
      const code = `switch (value) {
  case 1:
    // fallthrough
  case 2:
    // do something
    action();
    break;
  default:
    // default case
    defaultAction();
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`switch (value) {
  case 1:
  case 2:
    action();
    break;
  default:
    defaultAction();
}`);
    });
  });

  describe("ES6+ features", () => {
    it("should handle comments in destructuring assignments", () => {
      const code = `const {
  // property a
  a,
  // property b
  b: {
    // nested c
    c
  }
} = obj;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const {
  a,
  b: {
    c
  }
} = obj;`);
    });

    it("should handle comments in spread/rest operators", () => {
      const code = `const arr = [
  1,
  // spread comment
  ...otherArr,
  2
];

function test(
  a,
  // rest comment
  ...rest
) {}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).not.toContain("spread comment");
      expect(output.output).not.toContain("rest comment");
    });

    it("should handle comments in class syntax", () => {
      const code = `class Example {
  // constructor comment
  constructor() {}

  // static comment
  static staticMethod() {}

  // private comment
  #privateField = 1;

  // getter comment
  get value() { return this.#privateField; }

  // setter comment
  set value(v) { this.#privateField = v; }
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`class Example {
  constructor() {}

  static staticMethod() {}

  #privateField = 1;

  get value() { return this.#privateField; }

  set value(v) { this.#privateField = v; }
}`);
    });

    it("should handle comments with import/export statements", () => {
      const code = `// import comment
import { foo } from 'bar';
// export comment
export const x = 1;
// default export comment
export default function() {}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`import { foo } from 'bar';
export const x = 1;
export default function() {}`);
    });
  });

  describe("option combinations", () => {
    it("should handle all options enabled together", () => {
      const code = `/**
 * JSDoc comment
 */
// TODO: implement this
// eslint-disable-next-line
function test() {
  // Some other comment
  // KEEP: custom pattern
  return 1;
}`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: {
          "remove-all": ["error", {
            preserveJSDoc: true,
            preservePrefix: ["TODO"],
            preservePatterns: ["^KEEP:"]
          }]
        },
      });
      expect(output.output).toContain("JSDoc comment");
      expect(output.output).toContain("TODO:");
      expect(output.output).toContain("eslint-disable");
      expect(output.output).toContain("KEEP:");
      expect(output.output).not.toContain("Some other comment");
    });

    it("should respect option priority correctly", () => {
      const code = `// TODO: this is important
/** JSDoc */
/* Regular block */
// Regular line
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: {
          "remove-all": ["error", { preservePrefix: ["TODO"] }]
        },
      });
      expect(output.output).toContain("TODO:");
      expect(output.output).not.toContain("JSDoc");
      expect(output.output).not.toContain("Regular");
    });
  });

  describe("file boundaries", () => {
    it("should handle comment at very start of file", () => {
      const code = `// First line comment
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should handle comment at very end of file with no trailing newline", () => {
      const code = `const x = 1;
// Last line`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toContain("const x = 1;");
      expect(output.output).not.toContain("Last line");
    });

    it("should handle file with only comments", () => {
      const code = `// Comment 1
/* Comment 2 */
// Comment 3`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output.trim()).toBe("");
    });

    it("should handle files with shebang-like comments", () => {
      const code = `#!/usr/bin/env node
// Regular comment
const x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      // Note: ESLint treats shebangs as comments in module code
      // The removal is expected behavior
      expect(output.output).not.toContain("Regular comment");
      expect(output.output).toContain("const x = 1;");
    });
  });

  describe("performance edge cases", () => {
    it("should handle files with many comments efficiently", () => {
      const comments = Array(100).fill(null).map((_, i) => `// Comment ${i}`).join('\n');
      const code = `${comments}\nconst x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });

    it("should handle very long single-line comments", () => {
      const longComment = "// " + "a".repeat(10000);
      const code = `${longComment}\nconst x = 1;`;
      const output = linter.verifyAndFix(code, {
        parserOptions: PARSER_OPTIONS,
        rules: { "remove-all": "error" },
      });
      expect(output.output).toBe(`const x = 1;`);
    });
  });
});
