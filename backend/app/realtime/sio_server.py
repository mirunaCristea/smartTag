import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    json = None,
)

#Evenimente de baza

@sio.event
async def connect(sid, environ, auth):
    await sio.save_session(sid, {"device_id": (auth or {}).get("device_id")})
    await sio.emit("server_info", {"msg": "connected", "sid": sid}, to=sid)


@sio.event
async def disconnect(sid):
    pass


#ESP -> server: telemetrie

@sio.event
async def esp_telemetry(sid, data):
    # TODO: validare + persistare în DB dacă vrei
    # broadcast către dashboarduri
    await sio.emit("telemetry_update", data)

# web client -> server: subscribere la o “cameră”
@sio.event
async def join_room(sid, data):
    room = data.get("room")
    if room:
        sio.enter_room(sid, room)
        await sio.emit("joined", {"room": room}, to=sid)
