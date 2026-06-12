# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately:

1. **Do NOT** create a public GitHub issue
2. Email us at security@YOUR_DOMAIN with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

3. We aim to respond within 48 hours
4. We will work with you to understand and address the issue
5. Once fixed, we will credit you (if you wish) in the release notes

## Security Best Practices

When contributing code, please ensure:
- No hardcoded secrets or API keys
- User input is properly validated and sanitized
- SQL injection prevention via parameterized queries
- XSS prevention via proper escaping
- CSRF protection for state-changing operations

## Dependencies

We keep dependencies up to date and monitor for vulnerabilities:
- Run `composer audit` before releases
- Run `npm audit` for JavaScript dependencies
- Security updates are applied promptly