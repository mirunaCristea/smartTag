import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)

#Evenimente de baza

@sio.event
async def connect(sid, environ):
    print(f"Client conectat: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client deconectat: {sid}")

@sio.on("ping")
async def ping(sid,data):
    await sio.emit("pong", {"echo":data})
