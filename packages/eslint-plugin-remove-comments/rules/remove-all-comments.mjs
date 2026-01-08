export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Remove all comments except eslint-disable and TypeScript directives",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          preservePatterns: {
            type: "array",
            items: { type: "string" },
            description: "Additional regex patterns for comments to preserve",
          },
          preserveJSDoc: {
            type: "boolean",
            description: "Preserve JSDoc comments (/** ... */)",
            default: false,
          },
          preservePrefix: {
            type: "array",
            items: { type: "string" },
            description: "Preserve comments starting with these prefixes (e.g. TODO, FIXME)",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    const options = context.options[0] || {};
    const customPatterns = (options.preservePatterns || []).map(
      (p) => new RegExp(p),
    );

    const preservePatterns = [
      /^\s*eslint-disable/,
      /^\s*eslint-enable/,
      /^\s*@ts-/,
      /^\s*\/\s*<reference/,
      ...customPatterns,
    ];

    if (options.preservePrefix && options.preservePrefix.length > 0) {
      const prefixPattern = options.preservePrefix.join("|");
      preservePatterns.push(
        new RegExp(`^\\s*(${prefixPattern}):`, "i"),
      );
    }

    function isInEmptyCatchBlock(comment) {
      let result = false;
      const visited = new WeakSet();

      function traverse(node) {
        if (!node || typeof node !== "object" || visited.has(node)) {
          return;
        }
        visited.add(node);

        if (result) return;

        if (
          node.type === "CatchClause" &&
          node.body &&
          node.body.type === "BlockStatement"
        ) {
          const catchBody = node.body;

          if (
            comment.range[0] >= catchBody.range[0] &&
            comment.range[1] <= catchBody.range[1]
          ) {
            if (catchBody.body.length === 0) {
              result = true;
              return;
            }
          }
        }

        const astProperties = [
          "body",
          "handler",
          "block",
          "consequent",
          "alternate",
          "argument",
          "arguments",
          "callee",
          "expressions",
          "elements",
          "properties",
          "key",
          "value",
          "left",
          "right",
          "test",
          "update",
          "init",
          "declarations",
          "id",
          "params",
          "defaults",
          "rest",
          "superClass",
          "object",
          "property",
          "computed",
          "specifiers",
          "source",
          "local",
          "exported",
          "declaration",
          "expression",
          "statements",
          "cases",
          "consequent",
          "alternate",
          "finalizer",
          "discriminant",
          "param",
          "quasi",
          "quasis",
          "tag",
        ];

        for (const prop of astProperties) {
          if (node[prop]) {
            if (Array.isArray(node[prop])) {
              node[prop].forEach((child) => traverse(child));
            } else {
              traverse(node[prop]);
            }
          }
        }
      }

      traverse(sourceCode.ast);
      return result;
    }

    function shouldPreserveComment(comment) {
      const commentText = comment.value.trim();
      const cleanedText = commentText.replace(/^\*\s*/, "").trim();

      if (options.preserveJSDoc && comment.type === "Block") {
        const rawComment = sourceCode.text.slice(comment.range[0], comment.range[1]);
        if (rawComment.startsWith("/**")) {
          return true;
        }
      }

      if (
        preservePatterns.some(
          (pattern) => pattern.test(commentText) || pattern.test(cleanedText),
        )
      ) {
        return true;
      }

      if (isInEmptyCatchBlock(comment)) {
        return true;
      }

      return false;
    }

    function getLineRange(comment) {
      const text = sourceCode.text;
      const start = comment.range[0];
      const end = comment.range[1];

      let lineStart = start;
      while (lineStart > 0 && text[lineStart - 1] !== "\n") {
        lineStart--;
      }

      let lineEnd = end;
      while (lineEnd < text.length && text[lineEnd] !== "\n") {
        lineEnd++;
      }

      return { lineStart, lineEnd, lineText: text.slice(lineStart, lineEnd) };
    }

    function isCommentOnOwnLine(comment) {
      const { lineText } = getLineRange(comment);

      if (comment.type === "Line") {
        const beforeComment = lineText.substring(0, lineText.indexOf("//"));
        return beforeComment.trim() === "";
      }

      if (comment.type === "Block") {
        const beforeComment = lineText.substring(0, lineText.indexOf("/*"));
        const afterComment = lineText.substring(lineText.lastIndexOf("*/") + 2);
        return beforeComment.trim() === "" && afterComment.trim() === "";
      }

      return false;
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.forEach((comment) => {
          if (!shouldPreserveComment(comment)) {
            context.report({
              node: comment,
              loc: comment.loc,
              message: "Remove comment",
              fix(fixer) {
                const { lineStart, lineEnd } = getLineRange(comment);

                const textBefore = sourceCode.text.slice(0, comment.range[0]);
                const textAfter = sourceCode.text.slice(comment.range[1]);

                let checkStart = comment.range[0];
                let checkEnd = comment.range[1];

                while (
                  checkStart > 0 &&
                  sourceCode.text[checkStart - 1] !== "{"
                ) {
                  checkStart--;
                  if (!/\s/.test(sourceCode.text[checkStart])) {
                    break;
                  }
                }

                while (
                  checkEnd < sourceCode.text.length &&
                  sourceCode.text[checkEnd] !== "}"
                ) {
                  if (!/\s/.test(sourceCode.text[checkEnd])) {
                    break;
                  }
                  checkEnd++;
                }

                if (
                  checkStart > 0 &&
                  sourceCode.text[checkStart - 1] === "{" &&
                  checkEnd < sourceCode.text.length &&
                  sourceCode.text[checkEnd] === "}"
                ) {
                  return fixer.removeRange([checkStart, checkEnd]);
                }

                if (isCommentOnOwnLine(comment)) {
                  const nextChar = sourceCode.text[lineEnd];
                  const includeNewline = nextChar === "\n" ? 1 : 0;
                  return fixer.removeRange([
                    lineStart,
                    lineEnd + includeNewline,
                  ]);
                } else {
                  let removeStart = comment.range[0];
                  let removeEnd = comment.range[1];

                  const leadingSpaceMatch = textBefore.match(/[ \t]+$/);
                  if (leadingSpaceMatch) {
                    removeStart -= leadingSpaceMatch[0].length;
                  }

                  const trailingSpaceMatch = textAfter.match(/^[ \t]+/);
                  if (trailingSpaceMatch && !textAfter.startsWith("\n")) {
                    removeEnd += trailingSpaceMatch[0].length;
                  }

                  return fixer.removeRange([removeStart, removeEnd]);
                }
              },
            });
          }
        });
      },
    };
  },
};
