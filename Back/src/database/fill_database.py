import json
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from src.models.product import Product
from src.logging_config import logger

# Загрузка продуктов из JSON-файла и добавление их в базу данных
async def load_products_from_json(db: AsyncSession, file_path: str):
    try:
        filepath = Path(file_path)
        print(filepath)
        if filepath.exists():
            logger.info("File exists!")
        # Открываем и загружаем данные из JSON-файла
        with open(file_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
            logger.info(f"Successfully loaded products from {file_path}")
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        return
    except json.JSONDecodeError:
        logger.error("Error decoding JSON from the file.")
        return

    for product_data in products_data:
        # Создаем объект Product из данных
        product = Product(
            name=product_data["name"],
            weight=product_data["weight"],
            calories=product_data["calories"],
            proteins=product_data["proteins"],
            fats=product_data["fats"],
            carbohydrates=product_data["carbohydrates"],
            description=product_data["description"],
            picture_path=product_data["picture_path"],
            is_public=product_data["is_public"],
            user_id=product_data["user_id"]
        )
        db.add(product)

    try:
        # Применяем изменения в базу данных
        await db.commit()
        logger.info("Products successfully added to the database.")
    except Exception as e:
        # Откатываем транзакцию в случае ошибки
        await db.rollback()
        logger.error(f"Error committing to database: {e}")

# Заполнение базы данных продуктами из JSON-файла
async def fill_database(db: AsyncSession, file_path: str):
    await load_products_from_json(db, file_path)
