from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from src.models.subscription import Subscription

def get_subscription(db: Session, user_id: int):
    return db.query(Subscription).filter(Subscription.user_id == user_id).first()

def activate_subscription(db: Session, user_id: int, duration_days=30, auto_renew=True):
    sub = get_subscription(db, user_id)
    if not sub:
        sub = Subscription(user_id=user_id)
        db.add(sub)

    sub.status = "active"
    sub.expires_at = datetime.utcnow() + timedelta(days=duration_days)
    sub.auto_renew = auto_renew
    db.commit()
    return sub

def deactivate_subscription(db: Session, user_id: int):
    sub = get_subscription(db, user_id)
    if not sub:
        return None

    sub.auto_renew = False  # Подписка остаётся активной, но без продления
    db.commit()
    return sub

def toggle_auto_renew(db: Session, user_id: int, auto_renew: bool):
    sub = get_subscription(db, user_id)
    if not sub:
        return None

    sub.auto_renew = auto_renew
    db.commit()
    return sub

def check_subscription(db: Session, user_id: int):
    sub = get_subscription(db, user_id)
    if not sub or sub.status != "active" or sub.expires_at < datetime.utcnow():
        return False
    return True
