import { describe, it, expect, beforeEach } from "vitest";
import { Linter } from "eslint";
import removeAllComments from "../rules/remove-all-comments.mjs";

const PARSER_OPTIONS = {
  ecmaVersion: 2022,
  sourceType: "module",
  ecmaFeatures: { jsx: true }
};

describe("JSX comments", () => {
  let linter;

  beforeEach(() => {
    linter = new Linter({ configType: "eslintrc" });
    linter.defineRule("remove-all", removeAllComments);
  });

  it("should handle JSX with regular comments", () => {
    const code = `function Component() {
  return (
    <div>
      {/* JSX comment */}
      <p>Hello</p>
    </div>
  );
}`;
    const messages = linter.verify(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });
    expect(messages.length).toBeGreaterThan(0);
  });

  it("should remove JSX comments by default", () => {
    const code = `function Component() {
  // Regular comment
  return <div>Hello</div>;
}`;
    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });
    expect(output.output).toBe(`function Component() {
  return <div>Hello</div>;
}`);
  });

  it("should handle JSX with multiple comment types", () => {
    const code = `function Component() {
  // Before JSX
  return (
    <div>
      {/* Inside JSX */}
      <p>Text</p>
      {/* Another JSX comment */}
    </div>
  );
  // After JSX
}`;
    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });
    expect(output.output).not.toContain("Before JSX");
    expect(output.output).not.toContain("After JSX");
  });

  it("should preserve eslint directives in JSX files", () => {
    const code = `// eslint-disable-next-line
function Component() {
  return <div>Hello</div>;
}`;
    const messages = linter.verify(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });
    expect(messages).toHaveLength(0);
  });

  it("should preserve TypeScript directives in JSX", () => {
    const code = `function Component() {
  // @ts-ignore
  return <div>{unknownProp}</div>;
}`;
    const messages = linter.verify(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });
    expect(messages).toHaveLength(0);
  });

  it("should work with preserveJSDoc in JSX files", () => {
    const code = `/**
 * Component description
 * @param {Object} props
 */
function Component(props) {
  return <div>{props.name}</div>;
}`;
    const messages = linter.verify(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": ["error", { preserveJSDoc: true }] },
    });
    expect(messages).toHaveLength(0);
  });

  it("should handle JSX fragments with comments", () => {
    const code = `function Component() {
  return (
    <>
      {/* Fragment comment */}
      <div>Content</div>
    </>
  );
}`;
    const messages = linter.verify(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });
    expect(messages.length).toBeGreaterThan(0);
  });

  it("should handle nested JSX with comments", () => {
    const code = `function Component() {
  return (
    <div>
      {/* Outer comment */}
      <div>
        {/* Nested comment */}
        <p>Text</p>
      </div>
    </div>
  );
}`;
    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });
    expect(output.output).not.toContain("Outer comment");
    expect(output.output).not.toContain("Nested comment");
  });
});
