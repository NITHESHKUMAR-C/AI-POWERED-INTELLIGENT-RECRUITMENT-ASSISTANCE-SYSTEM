"""
File upload and handling utility
"""

import os
import uuid
import re
from pathlib import Path
from typing import Tuple

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB limit

def get_upload_dir() -> Path:
    """Return upload directory path, creating it if it doesn't exist."""
    base_dir = Path(__file__).resolve().parent.parent
    upload_dir = base_dir / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir

def sanitize_filename(filename: str) -> str:
    """Sanitize the uploaded file's original name."""
    clean_name = re.sub(r"[^\w\.\-\s]", "_", filename).strip()
    return clean_name or "uploaded_file"

def validate_file_extension(filename: str) -> Tuple[bool, str]:
    """Validate if file has a supported resume extension."""
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported file extension '{suffix}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    return True, suffix

def save_uploaded_file(file_bytes: bytes, original_filename: str) -> Tuple[str, str, int]:
    """
    Saves uploaded file content to disk.
    Returns: (saved_filepath, sanitized_name, file_size)
    """
    valid, err_msg = validate_file_extension(original_filename)
    if not valid:
        raise ValueError(err_msg)

    file_size = len(file_bytes)
    if file_size > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds maximum allowable limit of {MAX_FILE_SIZE_BYTES / (1024*1024):.1f} MB.")

    upload_dir = get_upload_dir()
    clean_name = sanitize_filename(original_filename)
    unique_prefix = uuid.uuid4().hex[:10]
    final_filename = f"{unique_prefix}_{clean_name}"
    final_path = upload_dir / final_filename

    with open(final_path, "wb") as f:
        f.write(file_bytes)

    return str(final_path), clean_name, file_size
