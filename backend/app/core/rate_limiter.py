"""
In-Memory Rate Limiter
======================
Lightweight sliding-window per-IP rate limiter to protect external LLM APIs from quota exhaustion.
Zero external dependencies (no Redis required for MVP hackathon scope).
"""

import time
from collections import defaultdict
from threading import Lock
from typing import Tuple


class InMemoryRateLimiter:
    """Sliding-window rate limiter per client IP."""

    def __init__(self, requests_per_minute: int = 10):
        self.limit = requests_per_minute
        self.window_seconds = 60.0
        self.requests = defaultdict(list)
        self.lock = Lock()

    def is_allowed(self, client_ip: str) -> Tuple[bool, int]:
        """
        Checks if client_ip is within the rate limit.
        Returns:
            (is_allowed: bool, remaining_requests: int)
        """
        now = time.time()
        cutoff = now - self.window_seconds

        with self.lock:
            # Purge timestamps outside the 60-second window
            self.requests[client_ip] = [ts for ts in self.requests[client_ip] if ts > cutoff]

            current_count = len(self.requests[client_ip])
            if current_count >= self.limit:
                return False, 0

            self.requests[client_ip].append(now)
            return True, self.limit - (current_count + 1)

    def reset(self):
        """Clears all tracked requests (useful for test isolation)."""
        with self.lock:
            self.requests.clear()


# Global rate limiter instance (10 requests per minute per IP)
qa_rate_limiter = InMemoryRateLimiter(requests_per_minute=10)

# Global rate limiter instance for AI negotiation advisor (10 requests per minute per user)
negotiation_rate_limiter = InMemoryRateLimiter(requests_per_minute=10)
