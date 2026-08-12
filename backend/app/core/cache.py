import time
import threading
from typing import Any, Optional, Dict, Tuple

class TTLCache:
    """
    Thread-safe, lightweight in-memory TTL cache for backend services and repositories.
    Supports key-value storage with expiration, manual invalidation, and prefix clearing.
    """

    def __init__(self, default_ttl_seconds: float = 30.0):
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._default_ttl = default_ttl_seconds
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        """Retrieve cached value if not expired."""
        with self._lock:
            if key not in self._cache:
                return None
            val, expire_time = self._cache[key]
            if time.time() > expire_time:
                del self._cache[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl_seconds: Optional[float] = None) -> None:
        """Store value with custom or default TTL."""
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        expire_time = time.time() + ttl
        with self._lock:
            self._cache[key] = (value, expire_time)

    def delete(self, key: str) -> None:
        """Remove a specific key from cache."""
        with self._lock:
            self._cache.pop(key, None)

    def invalidate_prefix(self, prefix: str) -> None:
        """Invalidate all keys starting with a specific prefix string."""
        with self._lock:
            keys_to_del = [k for k in self._cache if k.startswith(prefix)]
            for k in keys_to_del:
                del self._cache[k]

    def clear(self) -> None:
        """Clear all stored cache entries."""
        with self._lock:
            self._cache.clear()

# Global shared instance
ttl_cache = TTLCache()
