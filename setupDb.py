import os
import sqlite3

dbName = 'sqlite.db'

if os.path.exists(dbName):
    os.remove(dbName)

with open(dbName, 'w') as f:
    pass

conn = sqlite3.connect(dbName, check_same_thread=False)
cursor = conn.cursor()

cursor.execute(
    """ CREATE TABLE USERS (
        Username VARCHAR NOT NULL,
        Password VARCHAR NOT NULL,
        Project VARCHAR NOT NULL,
        PRIMARY KEY (Username)
    ); """
)

cursor.execute(
    """ CREATE TABLE IMAGES (
        Image_Name VARCHAR NOT NULL,
        Image_b64 VARCHAR NOT NULL,
        Uploaded_By VARCHAR NOT NULL,
        PRIMARY KEY (Image_Name, Uploaded_By)
    ); """
)

cursor.execute(
    """ CREATE TABLE ANNOTATED (
        Image_Name VARCHAR NOT NULL,
        Annotation VARCHAR NOT NULL,
        Uploaded_By VARCHAR NOT NULL
    ); """
)

conn.commit()