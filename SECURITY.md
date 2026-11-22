# Security Policy

## Supported versions

Security fixes are released for the latest published version of [`@awarded/log4brains`](https://www.npmjs.com/package/@awarded/log4brains) only.

| Version                                          | Supported                        |
| ------------------------------------------------ | -------------------------------- |
| latest release                                   | ✅                               |
| older releases                                   | ❌                               |
| `log4brains` (upstream npm package by thomvaill) | ❌ — not maintained by this fork |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Report them privately with GitHub's private vulnerability reporting:

1. Go to the [Security tab](https://github.com/FreakinWard/log4brains/security) of this repository.
2. Click **Report a vulnerability**.
3. Describe the issue, the affected version, and steps to reproduce it if possible.

You can expect an acknowledgement within 7 days. Once the issue is confirmed, a fix will be prepared privately and a security advisory will be published together with the patched release. Reporters are credited in the advisory unless they prefer otherwise.

## Scope

Log4brains is a CLI and static site generator. The `log4brains preview` server is intended for local use only and should not be exposed to untrusted networks.
