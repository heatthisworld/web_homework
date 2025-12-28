"""
Generate a BCrypt hash identical to Spring Security's default PasswordEncoder output.

Usage:
    python hash_password.py --password your_password

Notes:
- Requires `bcrypt` (`pip install bcrypt`).
- Output format matches Spring's `{bcrypt}<hash>`.
"""

import argparse
import bcrypt


def main() -> None:
    parser = argparse.ArgumentParser(description="Hash password with bcrypt (Spring-compatible).")
    parser.add_argument("--password", required=True, help="Plain password to hash")
    args = parser.parse_args()

    salt = bcrypt.gensalt(rounds=10)  # Spring default strength 10
    hashed = bcrypt.hashpw(args.password.encode("utf-8"), salt)
    # Spring stores as {bcrypt}<hash>
    print(f"{{bcrypt}}{hashed.decode('utf-8')}")


if __name__ == "__main__":
    main()
