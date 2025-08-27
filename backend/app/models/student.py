from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Student(Base):
    __tablename__ = "studenti"

    id = Column(Integer, primary_key=True, index=True)
    nume = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    uid_hash = Column(String, unique=True, index=True)