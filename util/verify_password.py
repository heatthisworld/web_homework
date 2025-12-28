"""
Verify a plain password against a BCrypt hash (Spring-compatible) and, on success, output the plain text.

Usage:
    python verify_password.py --password your_password --hash "{bcrypt}$2a$10$..."

Notes:
- BCrypt不可逆，脚本只能校验并在匹配时回显明文。
- Requires `bcrypt` (`pip install bcrypt`).
- Accepts hashes with or without the `{bcrypt}` prefix.
"""

import argparse
import bcrypt


def strip_prefix(bcrypt_hash: str) -> str:
    # remove whitespace/newlines and optional quotes/prefix
    cleaned = "".join(bcrypt_hash.strip().strip('"').strip("'").split())
    if cleaned.startswith("{bcrypt}"):
        cleaned = cleaned[len("{bcrypt}") :]
    # if there's an embedded $2* later, keep from there
    if not cleaned.startswith("$2") and "$2" in cleaned:
        cleaned = cleaned[cleaned.index("$2") :]
    return cleaned


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify password against bcrypt hash.")
    parser.add_argument("--password", required=True, help="Plain password to verify")
    parser.add_argument("--hash", required=True, dest="bcrypt_hash", help="Stored bcrypt hash")
    args = parser.parse_args()

    stored = strip_prefix(args.bcrypt_hash)
    try:
        ok = bcrypt.checkpw(args.password.encode("utf-8"), stored.encode("utf-8"))
        print(args.password if ok else "mismatch")
    except ValueError:
        print("mismatch (hash format invalid after cleaning)")


if __name__ == "__main__":
    main()
