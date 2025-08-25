from fastapi import FastAPI
import socketio

# creezi serverul socketio
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    ping_interval=25,
    ping_timeout=60,
)

# creezi aplicația ASGI socketio
sio_app = socketio.ASGIApp(sio)

# creezi aplicația FastAPI
app = FastAPI()

@app.get("/api/health")
def health():
    return {"status": "healthy"}

# îmbraci FastAPI-ul în socketio
app = socketio.ASGIApp(sio, other_asgi_app=app)
