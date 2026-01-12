import time

class TTLCache:
    def __init__(self, ttl_seconds: int):
        self.ttl = ttl_seconds
        self.store = {}

    def get(self, key):
        value = self.store.get(key)
        if not value:
            return None
        expires, data = value
        if time.time() > expires:
            self.store.pop(key, None)
            return None
        return data

    def set(self, key, value):
        self.store[key] = (time.time() + self.ttl, value)
