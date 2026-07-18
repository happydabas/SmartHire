import re

def clean_filename(filename: str) -> str:
    """Sanitize uploaded filenames to prevent directory traversal issues."""
    # Strip directory path separators and preserve basic word characters/dots/hyphens
    filename = re.sub(r"[^\w\.\-]", "_", filename)
    return filename

def check_allowed_extension(filename: str, allowed_extensions: set) -> bool:
    """Verify standard file formats (like PDF or DOCX for resume uploads)."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions
