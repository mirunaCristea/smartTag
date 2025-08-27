from sqlalchemy import Column,Integer,String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.db import Base


class Prezenta(Base):
    __tablename__ = "prezente"

    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    uid_hash = Column(String, index=True)
    student_id = Column(Integer, ForeignKey("studenti.id"), nullable=True)
    status = Column(String, default="accepted")  # accepted/denied/unknown_card/duplicate/out_of_window
    student = relationship("Student")