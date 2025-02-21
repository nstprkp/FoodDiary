from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from src.cache.cache import cache
from src.exceptions import http_exception_handler, general_exception_handler, not_found_handler, \
    method_not_allowed_handler, bad_request_handler, \
    unauthorized_handler, forbidden_handler, internal_server_error_handler, bad_gateway_handler, \
    temporary_redirect_handler, unprocessable_entity_handler
from src.routers.auth_router import auth_router
from src.routers.user_router import user_router
from .logging_config import logger, LogRequestMiddleware

app = FastAPI(
    title="Food Diary",
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(307, temporary_redirect_handler)
app.add_exception_handler(400, bad_request_handler)
app.add_exception_handler(401, unauthorized_handler)
app.add_exception_handler(403, forbidden_handler)
app.add_exception_handler(404, not_found_handler)
app.add_exception_handler(405, method_not_allowed_handler)
app.add_exception_handler(RequestValidationError, unprocessable_entity_handler)
app.add_exception_handler(500, internal_server_error_handler)
app.add_exception_handler(502, bad_gateway_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.add_middleware(LogRequestMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await cache.connect()

@app.on_event("shutdown")
async def shutdown():
    await cache.disconnect()

app.include_router(auth_router, prefix="/auth")
app.include_router(user_router, prefix="/user")

