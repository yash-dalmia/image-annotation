import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from datetime import datetime, timedelta

class AuthHandler():
    security = HTTPBearer()
    pwdContext = CryptContext(schemes=['bcrypt'], deprecated='auto')
    secret = 'SECRET'

    def getPasswordHash(self, pwd):
        return self.pwdContext.hash(pwd)
    
    def verifyPassword(self, plainPwd, hashedPwd):
        return self.pwdContext.verify(plainPwd, hashedPwd)
    
    def encodeToken(self, userId):
        payload = {
            'exp': datetime.utcnow() + timedelta(days=0, minutes=360),
            'iat': datetime.utcnow(),
            'sub': userId
        }
        return jwt.encode(payload, self.secret, algorithm='HS256')
    
    def decodeToken(self, token):
        try:
            payload = jwt.decode(token, self.secret, algorithms=['HS256'])
            return payload['sub']
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail='Auth token has expired')
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail='Invalid auth token')
    
    def authWrapper(self, auth: HTTPAuthorizationCredentials=Security(security)):
        return self.decodeToken(auth.credentials)
