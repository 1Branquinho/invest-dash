class AppError(Exception):
    def __init__(self, code: str, message: str, http_status: int):
        self.code = code
        self.message = message
        self.http_status = http_status

class ValidationError(AppError):
    pass

class NotFoundError(AppError):
    pass

class UpstreamError(AppError):
    pass
