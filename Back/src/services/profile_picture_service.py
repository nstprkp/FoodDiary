from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.logging_config import logger
from src.models.user import User
from src.cache.cache import cache

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif"}

# Функция для загрузки фотографии профиля пользователя
async def upload_profile_picture(file: UploadFile, current_user: User, db: AsyncSession):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        logger.warning(f"Attempted to upload an unsupported image type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Only images (JPEG, PNG, GIF) are allowed")

    user = await db.get(User, current_user.id)
    if not user:
        logger.error(f"User with ID {current_user.id} not found")
        raise HTTPException(status_code=404, detail="User not found")

    # Обновление фотографии профиля пользователя
    user.profile_picture = await file.read()
    await db.commit()
    await db.refresh(user)
    logger.info(f"Profile picture updated for user {current_user.id}")

    # Очистка кэша
    cache_key1 = f"user:{user.login}"
    cache_key2 = f"user:{user.email}"
    await cache.delete(cache_key1)
    await cache.delete(cache_key2)
    logger.info(f"Cache cleared for user {current_user.id} (keys: {cache_key1}, {cache_key2})")

    return {"message": "Profile picture updated"}

# Функция для получения фотографии профиля пользователя
async def get_profile_picture(current_user: User, db: AsyncSession):
    user = await db.get(User, current_user.id)
    if not user or not user.profile_picture:
        logger.warning(f"Profile picture not found for user {current_user.id}")
        raise HTTPException(status_code=404, detail="No profile picture found")

    logger.info(f"Profile picture retrieved for user {current_user.id}")
    return user.profile_picture