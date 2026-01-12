import time

class TTLCache:
    def __init__(self, ttl_seconds: int):
        self.ttl = int(ttl_seconds)
        self.store = {}

    def get(self, key):
        item = self.store.get(key)
        if not item:
            return None
        expires, data = item
        if time.time() > expires:
            self.store.pop(key, None)
            return None
        return data

    def set(self, key, value, ttl_seconds: int | None = None):
        ttl = self.ttl if ttl_seconds is None else int(ttl_seconds)
        self.store[key] = (time.time() + ttl, value)
