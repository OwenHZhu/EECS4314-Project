import argparse
import os
import sys
from pathlib import Path

from dotenv import find_dotenv, load_dotenv


def _load_environment(explicit_env_path: str | None = None) -> str | None:
    search_paths: list[Path] = []

    if explicit_env_path:
        search_paths.append(Path(explicit_env_path).expanduser().resolve())

    search_paths.extend(
        [
            Path(__file__).resolve().parents[3],  # repo root
            Path(__file__).resolve().parents[2],  # backend root
            Path(__file__).resolve().parents[1],  # discussion_service root
            Path.cwd(),
        ]
    )

    for path in search_paths:
        if not path:
            continue

        if path.is_file():
            load_dotenv(path, override=False)
            return str(path)

        if path.is_dir():
            for filename in [".env", ".env.local", ".env.development", ".env.production"]:
                env_path = path / filename
                if env_path.exists():
                    load_dotenv(env_path, override=False)
                    return str(env_path)

    discovered = find_dotenv(usecwd=True)
    if discovered:
        load_dotenv(discovered, override=False)
        return discovered

    return None


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a discussion thread via the backend service")
    parser.add_argument(
        "--env-file",
        default=None,
        help="Optional path to a .env file containing SUPABASE_URL and SUPABASE_KEY",
    )
    args = parser.parse_args()

    loaded_path = _load_environment(args.env_file)
    if loaded_path:
        print(f"Loaded environment from {loaded_path}")
    else:
        print("No .env file found. Relying on shell environment variables instead.")

    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("Missing SUPABASE_URL or SUPABASE_KEY.")
        print("Set them in your shell or create a .env file with these values:")
        print("  SUPABASE_URL=your-project-url")
        print("  SUPABASE_KEY=your-key")
        sys.exit(1)

    DISCUSSION_SERVICE_DIR = Path(__file__).resolve().parents[1]
    BACKEND_ROOT = DISCUSSION_SERVICE_DIR.parent
    for path in [str(BACKEND_ROOT), str(DISCUSSION_SERVICE_DIR)]:
        if path not in sys.path:
            sys.path.insert(0, path)

    from services.discussion_service import create_thread

    user_id = "081a6b73-763d-4cc6-8961-5de1ea7b7d2b"
    if not user_id:
        print("Please set TEST_USER_ID to a real user ID from your Supabase users table.")
        sys.exit(1)
    title = "Hello from the backend service"
    content = "This thread was created by a Python script using the discussion service."
    book_id = "5230fa53-b5ac-4327-849d-e46a21367d9e"

    try:
        thread = create_thread(
            user_id=user_id,
            title=title,
            content=content,
            book_id=book_id,
        )

        payload = thread.model_dump() if hasattr(thread, "model_dump") else thread.dict()
        print("Thread created successfully")
        print(payload)
    except Exception as exc:
        print(f"Failed to create thread: {exc}")
        raise


if __name__ == "__main__":
    main()
