# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.3.x   | Yes                |
| 1.2.x   | Yes                |
| 1.1.x   | Security fixes only|
| < 1.1   | No                 |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@myuserjourney.co.uk**

Include the following information in your report:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass, CSRF)
- **Full paths of affected source files**
- **Location of the affected code** (tag/branch/commit or direct URL)
- **Step-by-step instructions to reproduce** the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact assessment** of the vulnerability

### Response Timeline

- **Acknowledgement**: Within 48 hours of receiving your report
- **Initial Assessment**: Within 5 business days
- **Resolution Target**: Within 30 days for critical vulnerabilities
- **Disclosure**: Coordinated disclosure after a fix is available

### What to Expect

1. **Confirmation** that we received your report
2. **Assessment** of the vulnerability severity and impact
3. **Regular updates** on our progress towards a fix
4. **Credit** in the security advisory (unless you prefer anonymity)

### Safe Harbour

We consider security research conducted in good faith to be authorised. We will not pursue legal action against researchers who:

- Make a good faith effort to avoid privacy violations and data destruction
- Only interact with accounts you own or have explicit permission to test
- Do not exploit vulnerabilities beyond what is necessary to demonstrate them
- Report vulnerabilities promptly and do not disclose them publicly before a fix

## Security Best Practices for Self-Hosting

If you are self-hosting MyUserJourney, please follow these guidelines:

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique values for `SESSION_SECRET`
- Rotate secrets periodically
- Use environment-specific configurations for production

### Database Security

- Use strong PostgreSQL passwords
- Restrict database access to application servers only
- Enable SSL for database connections in production
- Regularly backup your database
- Review and apply PostgreSQL security updates

### Application Security

- Keep all dependencies up to date (`npm audit`)
- Enable HTTPS in production (use a reverse proxy like Nginx or Caddy)
- Configure proper CORS headers for your domain
- Set secure cookie flags in production
- Use rate limiting on authentication endpoints

### GDPR Compliance

- Enable IP anonymisation for EU visitors
- Configure appropriate data retention periods
- Ensure consent mechanisms are properly configured
- Regularly review and purge expired data
- Test Right to Erasure and Data Portability features

## Known Security Measures

MyUserJourney includes the following built-in security features:

- **Password hashing** with bcrypt (12 rounds)
- **Session management** with secure cookies
- **CSRF protection** on state-changing endpoints
- **Input validation** using Zod schemas on all API endpoints
- **SQL injection prevention** via Drizzle ORM parameterised queries
- **XSS prevention** through React's built-in escaping
- **SSRF protection** on Site Research URL validation
- **IP anonymisation** for privacy compliance
- **Rate limiting** on authentication endpoints
- **Secure password reset** with cryptographic tokens and expiry

## Dependencies

We regularly audit our dependencies for known vulnerabilities. Our CI pipeline includes:

- `npm audit` for dependency vulnerability scanning
- GitHub CodeQL for static analysis
- Dependabot for automated dependency updates

## Contact

For security-related questions that are not vulnerabilities, you can open a GitHub Discussion.

For vulnerability reports, please use: **security@myuserjourney.co.uk**
