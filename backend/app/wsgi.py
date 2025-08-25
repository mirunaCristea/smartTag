from app.__init__ import app, sio   # importi din main.py unde ai definit sio + FastAPI
import socketio

# Creezi ASGIApp care combină FastAPI cu Socket.IO
application = socketio.ASGIApp(sio, other_asgi_app=app)
