from app.main import create_app
import socketio
from app.realtime.sio_server import sio

fastapi_app = create_app()

app = socketio.ASGIApp(
    sio,
    other_asgi_app=fastapi_app,
    socketio_path="socket.io"
)
# acesta este punctul de intrare in uvicorn