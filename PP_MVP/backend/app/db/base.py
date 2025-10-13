from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models here so Alembic can detect them
from app.models.user import User  # noqa
from app.models.wine import Wine  # noqa
from app.models.password_reset import PasswordReset  # noqa
from app.models.ocr_feedback import OcrFeedback  # noqa

