from lib2to3.pytree import Base
from pydantic import BaseModel
from typing import List

class AuthDetails(BaseModel):
    username: str
    password: str

class AuthDetailsForRegistration(BaseModel):
    username: str
    password: str
    project: str

class Image(BaseModel):
    imageName: str
    imageb64: str
    
class ImageList(BaseModel):
    items: List[Image]
    
class Annotation(BaseModel):
    caption: str
    x1: str
    y1: str
    x2: str
    y2: str

class AllAnnotations(BaseModel):
    items: List[Annotation]