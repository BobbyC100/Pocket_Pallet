#!/usr/bin/env python3
"""Generate a secure SECRET_KEY for production."""
import secrets

print("=" * 60)
print("🔐 SECRET KEY GENERATOR")
print("=" * 60)
print()
print("Copy this SECRET_KEY to Railway environment variables:")
print()
print(secrets.token_urlsafe(32))
print()
print("=" * 60)

