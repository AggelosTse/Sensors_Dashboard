from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, ForeignKey, DateTime, Float, Text, func
from sqlalchemy.orm import DeclarativeBase,Mapped, mapped_column, relationship
from typing import List, Optional
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class Role(Base):
    __tablename__ = "roles"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    
    users: Mapped[List["User"]] = relationship(back_populates="role")
    
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)


    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    fullName: Mapped[str] = mapped_column(String(100), nullable=False)

    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"))    
    role: Mapped["Role"] = relationship(back_populates="users")
    
class SensorCategory(Base):
    __tablename__ = "sensor_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    sensors: Mapped[List["Sensor"]] = relationship(back_populates="category")

class Sensor(Base):
    __tablename__ = "sensors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    metadata_info: Mapped[Optional[str]] = mapped_column(Text) 
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("sensor_categories.id", ondelete="SET NULL"))

    category: Mapped["SensorCategory"] = relationship(back_populates="sensors")
    measurements: Mapped[List["Measurement"]] = relationship(back_populates="sensor", cascade="all, delete-orphan")

class Measurement(Base):
    __tablename__ = "measurements"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    sensor_id: Mapped[int] = mapped_column(ForeignKey("sensors.id", ondelete="CASCADE"))

    sensor: Mapped["Sensor"] = relationship(back_populates="measurements")
    
    
