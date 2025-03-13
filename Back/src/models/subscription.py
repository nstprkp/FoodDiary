from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from src.database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    status = Column(String, default="inactive")
    expires_at = Column(DateTime, nullable=True)
    auto_renew = Column(Boolean, default=True)

    user = relationship("User", back_populates="subscription")
