import type { Rule } from 'eslint';

export interface RemoveCommentsOptions {
  /**
   * Additional regex patterns for comments to preserve
   */
  preservePatterns?: string[];

  /**
   * Preserve JSDoc comments (/** ... *\/)
   * @default false
   */
  preserveJSDoc?: boolean;

  /**
   * Preserve comments starting with these prefixes (e.g. ["TODO", "FIXME"])
   */
  preservePrefix?: string[];
}

export interface RemoveCommentsRule extends Rule.RuleModule {
  meta: {
    type: 'suggestion';
    docs: {
      description: string;
      category: string;
      recommended: boolean;
    };
    fixable: 'code';
    schema: Array<{
      type: 'object';
      properties: {
        preservePatterns: {
          type: 'array';
          items: { type: 'string' };
          description: string;
        };
        preserveJSDoc: {
          type: 'boolean';
          description: string;
          default: boolean;
        };
        preservePrefix: {
          type: 'array';
          items: { type: 'string' };
          description: string;
        };
      };
      additionalProperties: false;
    }>;
  };
}

export interface Plugin {
  rules: {
    'remove-all': RemoveCommentsRule;
  };
}

declare const plugin: Plugin;
export default plugin;
