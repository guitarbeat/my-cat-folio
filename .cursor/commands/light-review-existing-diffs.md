# Light Review Existing Diffs

## Overview
Quick review of existing code changes to identify obvious issues without deep analysis.

## Quick Scan Checklist
- [ ] **Syntax & Style**
  - [ ] No obvious syntax errors
  - [ ] Consistent indentation and formatting
  - [ ] No commented-out code blocks
  - [ ] Proper variable naming

- [ ] **Common Issues**
  - [ ] No hardcoded values that should be configurable
  - [ ] No obvious memory leaks or resource issues
  - [ ] No missing error handling for critical operations
  - [ ] No security vulnerabilities (SQL injection, XSS, etc.)

- [ ] **Code Organization**
  - [ ] Functions are reasonably sized (< 50 lines)
  - [ ] No duplicate code blocks
  - [ ] Appropriate use of comments
  - [ ] Logical flow and structure

## Red Flags to Watch For
- [ ] **Performance Issues**
  - Nested loops that could be optimized
  - Unnecessary database queries in loops
  - Large data structures being copied unnecessarily
  - Missing indexes on database queries

- [ ] **Security Concerns**
  - User input not validated
  - Sensitive data in logs or error messages
  - Missing authentication checks
  - Insecure random number generation

- [ ] **Maintainability Issues**
  - Magic numbers without explanation
  - Complex conditional logic that could be simplified
  - Missing documentation for complex algorithms
  - Tight coupling between modules

## Quick Actions
1. **Scan for obvious bugs** - Look for common programming mistakes
2. **Check for style violations** - Ensure code follows project standards
3. **Verify test coverage** - Ensure new code has appropriate tests
4. **Look for performance issues** - Identify potential bottlenecks
5. **Check security basics** - Look for common security vulnerabilities

## Time Limit
- Aim for 5-10 minutes per file
- Focus on high-impact issues only
- Defer detailed analysis to full code review
- Flag items for deeper review if needed

## Output
- List of critical issues found
- Suggestions for improvement
- Areas that need deeper review
- Overall assessment (approve/needs work/blocking)
