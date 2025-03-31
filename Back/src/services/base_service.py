from typing import List, Optional, Type, Any
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, delete
from sqlalchemy.orm.loading import instances


class BaseService:
    model: Type = None
    read_schema: Type[BaseModel] = None

    # Получить все записи
    @classmethod
    async def get_all(cls, db: AsyncSession, **filters) -> List[Any]:
        query = select(cls.model)
        if filters:
            query = query.filter_by(**filters)

        result = await db.execute(query)
        items = result.scalars().all()

        if cls.read_schema:
            return [cls.read_schema.model_validate(item) for item in items]
        return items

    # Получить одну запись по ID
    @classmethod
    async def get_by_id(cls, db: AsyncSession, model_id: int) -> Optional[Any]:
        query = select(cls.model).where(cls.model.id == model_id)
        result = await db.execute(query)
        item = result.scalar_one_or_none()

        if item and cls.read_schema:
            return cls.read_schema.model_validate(item)
        return item

    # Получить одну запись по фильтрам
    @classmethod
    async def get_one_or_none(cls, db: AsyncSession, **filters) -> Optional[Any]:
        query = select(cls.model)
        if filters:
            query = query.filter_by(**filters)

        result = await db.execute(query)
        item = result.scalar_one_or_none()
        return item

    # Получить одну запись по фильтрам
    @classmethod
    async def get_one_or_none_schema(cls, db: AsyncSession, **filters) -> Optional[Any]:
        query = select(cls.model)
        if filters:
            query = query.filter_by(**filters)

        result = await db.execute(query)
        item = result.scalar_one_or_none()

        if item and cls.read_schema:
            return cls.read_schema.model_validate(item)
        return item

    # Создать новую запись
    @classmethod
    async def create(cls, db: AsyncSession, **data) -> Any:
        instance = cls.model(**data)
        db.add(instance)
        await db.commit()
        await db.refresh(instance)

        if cls.read_schema:
            return cls.read_schema.model_validate(instance)
        return instance

    # Обновить запись
    @classmethod
    async def update(cls, db: AsyncSession, model_id: int, **data) -> Optional[Any]:
        query = select(cls.model).where(cls.model.id == model_id)
        result = await db.execute(query)
        instance = result.scalar_one_or_none()

        if not instance:
            return None

        for key, value in data.items():
            setattr(instance, key, value)

        await db.commit()
        await db.refresh(instance)

        if cls.read_schema:
            return cls.read_schema.model_validate(instance)
        return instance

    # Удалить запись
    @classmethod
    async def delete(cls, db: AsyncSession, data) -> bool:
        instance = cls.model(**data)

        if not instance:
            return False

        await db.delete(instance)
        await db.commit()
        return True
