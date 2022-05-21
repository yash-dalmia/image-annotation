# Run this using command in shell:
# uvicorn main:app --reload

from auth import AuthHandler
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from schemas import AuthDetails, AuthDetailsForRegistration, ImageList, AllAnnotations
import sqlite3

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dbName = 'sqlite.db'
conn = sqlite3.connect(dbName, check_same_thread=False)
authHandler = AuthHandler()

@app.post('/register', status_code=201)
def register(authDetails: AuthDetailsForRegistration):
    cursor = conn.cursor()
    results = cursor.execute(f'''SELECT * FROM USERS WHERE Username='{authDetails.username}'; ''')
    row = results.fetchone()
    if row:
        raise HTTPException(status_code=400, detail='Username is taken')
    hashedPwd = authHandler.getPasswordHash(authDetails.password)
    
    cursor.execute(f'''INSERT INTO USERS VALUES ('{authDetails.username}', '{hashedPwd}', '{authDetails.project}'); ''')
    conn.commit()
    return

@app.post('/login')
def login(authDetails: AuthDetails):
    user = None
    cursor = conn.cursor()
    results = cursor.execute(f'''SELECT * FROM USERS WHERE Username='{authDetails.username}'; ''')
    row = results.fetchone()
    if row:
        user = {
            'username': row[0],
            'password': row[1]
        }
    
    if (user is None) or (not authHandler.verifyPassword(authDetails.password, user['password'])):
        raise HTTPException(status_code=401, detail='Invalid username or password')
    token = authHandler.encodeToken(user['username'])
    return {'token': token}

@app.post('/upload')
def upload(imageList: ImageList, username=Depends(authHandler.authWrapper)):
    cursor = conn.cursor()
    success = []
    failure = []
    for image in imageList.items:
        try:
            cursor.execute(f'''INSERT INTO IMAGES VALUES ('{image.imageName}', '{image.imageb64}', '{username}'); ''')
            success.append(image.imageName)
        except sqlite3.IntegrityError:
            failure.append(f'{image.imageName}: Image with this name already exists')
    conn.commit()
    return {'success': success, 'failure': failure}

@app.get('/images')
def getImages(username=Depends(authHandler.authWrapper)):
    images = []
    cursor = conn.cursor()
    results = cursor.execute(f'''SELECT Image_Name, Image_b64 FROM IMAGES WHERE Uploaded_By='{username}' ; ''')
    for row in results.fetchall():
        result2 = cursor.execute(f'''SELECT COUNT(Annotation) FROM ANNOTATED WHERE Image_Name='{row[0]}' AND Uploaded_By='{username}'; ''')
        images.append({'name': row[0], 'b64Data': row[1], 'annotations': result2.fetchone()[0]})
    return images

@app.get('/images/{imageName}')
def getImage(imageName, username=Depends(authHandler.authWrapper)):
    cursor = conn.cursor()
    results = cursor.execute(f'''SELECT Image_b64 FROM IMAGES where Image_Name='{imageName}'; ''')
    row = results.fetchone()
    if row:
        imageb64 = row[0]
        results = cursor.execute(f'''SELECT Annotation FROM ANNOTATED where Image_Name='{imageName}' and Uploaded_By='{username}'; ''')
        annotations = []
        for row in results.fetchall():
            [caption, x1str, y1str, x2str, y2str] = row[0].split('|')
            annotations.append({'caption': caption, 'x1': int(x1str),  'y1': int(y1str), 'x2': int(x2str), 'y2': int(y2str)})
        return {
            'imageb64': imageb64,
            'annotations': annotations    
        }
    else:
        raise HTTPException(status_code=404, detail='Image not found')

@app.post('/images/{imageName}/save')
def saveAnnotations(imageName, annotations: AllAnnotations, username=Depends(authHandler.authWrapper)):
    cursor = conn.cursor()
    cursor.execute(f'''DELETE FROM ANNOTATED WHERE Image_Name='{imageName}' and Uploaded_By='{username}'; ''')
    for ann in annotations.items:
        annotationStr = f'{ann.caption}|{ann.x1}|{ann.y1}|{ann.x2}|{ann.y2}'
        cursor.execute(f'''INSERT INTO ANNOTATED VALUES ('{imageName}', '{annotationStr}', '{username}'); ''')
    conn.commit()
    return
