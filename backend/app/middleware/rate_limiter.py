"""In-memory rate limiting middleware for FastAPI API endpoints.

Prevents billing or quota abuse on external services (Vertex AI / Firestore)
without requiring a Redis or heavy external database dependency.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class SimpleRateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        calc_limit: int = 10,
        write_limit: int = 5,
        window_seconds: int = 60,
    ) -> None:
        super().__init__(app)
        self.calc_limit = calc_limit
        self.write_limit = write_limit
        self.window_seconds = window_seconds
        
        # In-memory storage for request timestamps.
        self._calc_history: dict[str, list[float]] = defaultdict(list)
        self._write_history: dict[str, list[float]] = defaultdict(list)
        self._lock = threading.Lock()

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Only apply rate limits to API endpoints
        if path.startswith("/api/"):
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()

            # Limit calculator and insights generation requests
            if path in ("/api/calculate", "/api/insights"):
                with self._lock:
                    # Filter out older timestamps outside the rate limit window
                    self._calc_history[client_ip] = [
                        t for t in self._calc_history[client_ip]
                        if now - t < self.window_seconds
                    ]
                    if len(self._calc_history[client_ip]) >= self.calc_limit:
                        return JSONResponse(
                            status_code=429,
                            content={"detail": "Too many requests. Please try again later."},
                            headers={"Retry-After": str(self.window_seconds)},
                        )
                    self._calc_history[client_ip].append(now)

            # Limit snapshot entries saving and listing
            elif path.startswith("/api/entries"):
                with self._lock:
                    # Filter out older timestamps
                    self._write_history[client_ip] = [
                        t for t in self._write_history[client_ip]
                        if now - t < self.window_seconds
                    ]
                    if len(self._write_history[client_ip]) >= self.write_limit:
                        return JSONResponse(
                            status_code=429,
                            content={"detail": "Too many requests. Please try again later."},
                            headers={"Retry-After": str(self.window_seconds)},
                        )
                    self._write_history[client_ip].append(now)

        return await call_next(request)
