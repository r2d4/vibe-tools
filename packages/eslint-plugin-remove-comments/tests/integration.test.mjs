import { describe, it, expect, beforeEach } from "vitest";
import { Linter } from "eslint";
import removeAllComments from "../rules/remove-all-comments.mjs";

const PARSER_OPTIONS = { ecmaVersion: 2022, sourceType: "module" };

describe("Integration tests - Real-world scenarios", () => {
  let linter;

  beforeEach(() => {
    linter = new Linter({ configType: "eslintrc" });
    linter.defineRule("remove-all", removeAllComments);
  });

  it("should clean up a typical React component", () => {
    const code = `import React from 'react';

/**
 * User profile component
 * @param {Object} props - Component props
 * @param {string} props.name - User name
 * @param {string} props.email - User email
 */
function UserProfile({ name, email }) {
  // TODO: Add avatar support
  // Render user information
  return (
    <div className="profile">
      {/* User name display */}
      <h1>{name}</h1>
      {/* Email section */}
      <p>{email}</p>
    </div>
  );
}

export default UserProfile;`;

    const output = linter.verifyAndFix(code, {
      parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },
      rules: {
        "remove-all": ["error", {
          preserveJSDoc: true,
          preservePrefix: ["TODO"]
        }]
      },
    });

    expect(output.output).toContain("User profile component");
    expect(output.output).toContain("TODO: Add avatar support");
    expect(output.output).not.toContain("Render user information");
    expect(output.output).not.toContain("User name display");
    expect(output.output).not.toContain("Email section");
  });

  it("should handle a complex TypeScript-style file", () => {
    const code = `// @ts-check

/**
 * Calculate total price with tax
 * @param {number} price - Base price
 * @param {number} taxRate - Tax rate
 * @returns {number} Total price
 */
function calculateTotal(price, taxRate) {
  // Validate inputs
  if (price < 0) {
    throw new Error('Invalid price');
  }

  // @ts-ignore - Known issue with type
  const tax = price * taxRate;

  // Calculate final total
  return price + tax;
}

export { calculateTotal };`;

    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: {
        "remove-all": ["error", { preserveJSDoc: true }]
      },
    });

    expect(output.output).toContain("@ts-check");
    expect(output.output).toContain("Calculate total price");
    expect(output.output).toContain("@ts-ignore");
    expect(output.output).not.toContain("Validate inputs");
    expect(output.output).not.toContain("Calculate final total");
  });

  it("should clean API endpoint handler", () => {
    const code = `// API endpoint handler for user creation
async function createUser(req, res) {
  try {
    // Extract user data from request
    const { name, email } = req.body;

    // TODO: Add validation
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // FIXME: This should use a transaction
    // Save user to database
    const user = await db.users.create({ name, email });

    // Return success response
    res.json({ user });
  } catch (error) {
    // Log error for debugging
    console.error(error);
    // Return error response
    res.status(500).json({ error: 'Server error' });
  }
}`;

    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: {
        "remove-all": ["error", { preservePrefix: ["TODO", "FIXME"] }]
      },
    });

    expect(output.output).toContain("TODO: Add validation");
    expect(output.output).toContain("FIXME: This should use a transaction");
    expect(output.output).not.toContain("Extract user data");
    expect(output.output).not.toContain("Save user to database");
    expect(output.output).not.toContain("Return success response");
  });

  it("should handle configuration object with custom patterns", () => {
    const code = `const config = {
  // Server configuration
  server: {
    port: 3000,
    // KEEP: This is required for production
    host: 'localhost'
  },

  // Database settings
  database: {
    // @license MIT
    connectionString: process.env.DB_URL,
    // Regular comment
    poolSize: 10
  }
};`;

    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: {
        "remove-all": ["error", {
          preservePatterns: ["^KEEP:", "@license"]
        }]
      },
    });

    expect(output.output).toContain("KEEP: This is required for production");
    expect(output.output).toContain("@license MIT");
    expect(output.output).not.toContain("Server configuration");
    expect(output.output).not.toContain("Database settings");
    expect(output.output).not.toContain("Regular comment");
  });

  it("should handle test file with disabled linting", () => {
    const code = `/* eslint-disable no-undef */
describe('User service', () => {
  // Test setup
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should create user', async () => {
    // Arrange
    const userData = { name: 'John' };

    // Act
    const result = await createUser(userData);

    // Assert
    expect(result).toBeDefined();
  });
});
/* eslint-enable no-undef */`;

    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });

    expect(output.output).toContain("eslint-disable");
    expect(output.output).toContain("eslint-enable");
    expect(output.output).not.toContain("Test setup");
    expect(output.output).not.toContain("Arrange");
    expect(output.output).not.toContain("Act");
    expect(output.output).not.toContain("Assert");
  });

  it("should preserve license headers with custom pattern", () => {
    const code = `/**
 * @license
 * Copyright (c) 2024 Example Corp
 * Licensed under the MIT License
 */

// Regular import comment
import { helper } from './utils';

/**
 * Main application function
 */
function main() {
  // Application logic here
  return helper();
}`;

    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: {
        "remove-all": ["error", {
          preservePatterns: ["@license"]
        }]
      },
    });

    expect(output.output).toContain("@license");
    expect(output.output).toContain("Copyright");
    expect(output.output).not.toContain("Regular import comment");
    expect(output.output).not.toContain("Application logic here");
  });

  it("should handle utility functions with minimal comments", () => {
    const code = `// Utility functions for string manipulation

// Check if string is empty
export const isEmpty = (str) => !str || str.trim().length === 0;

// Capitalize first letter
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Truncate string to length
export const truncate = (str, length) => {
  // Handle edge cases
  if (str.length <= length) return str;
  // Add ellipsis
  return str.slice(0, length - 3) + '...';
};`;

    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: { "remove-all": "error" },
    });

    expect(output.output).not.toContain("Utility functions");
    expect(output.output).not.toContain("Check if string");
    expect(output.output).not.toContain("Capitalize first");
    expect(output.output).not.toContain("Handle edge cases");
    expect(output.output).toContain('isEmpty');
    expect(output.output).toContain('capitalize');
    expect(output.output).toContain('truncate');
  });

  it("should handle class with JSDoc and inline comments", () => {
    const code = `/**
 * User management class
 */
class UserManager {
  /**
   * Constructor
   * @param {Database} db - Database instance
   */
  constructor(db) {
    // Store database reference
    this.db = db;
    // Initialize cache
    this.cache = new Map();
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<User>}
   */
  async findById(id) {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    // Fetch from database
    const user = await this.db.users.findOne({ id });

    // Update cache
    this.cache.set(id, user);

    return user;
  }
}`;

    const output = linter.verifyAndFix(code, {
      parserOptions: PARSER_OPTIONS,
      rules: {
        "remove-all": ["error", { preserveJSDoc: true }]
      },
    });

    expect(output.output).toContain("User management class");
    expect(output.output).toContain("Constructor");
    expect(output.output).toContain("Find user by ID");
    expect(output.output).not.toContain("Store database reference");
    expect(output.output).not.toContain("Check cache first");
    expect(output.output).not.toContain("Fetch from database");
  });
});
