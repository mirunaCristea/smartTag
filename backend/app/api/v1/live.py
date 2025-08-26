from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, text: str):
        # trimite tuturor; dacă un client e închis, îl scoatem
        to_remove = []
        for ws in self.active:
            try:
                await ws.send_text(text)
            except Exception:
                to_remove.append(ws)
        for ws in to_remove:
            self.disconnect(ws)

manager = ConnectionManager()

router = APIRouter()

@router.websocket("/eco",)
async def ws_echo(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            msg = await ws.receive_text()
            await manager.broadcast(f"echo: {msg}")
    except WebSocketDisconnect:
        manager.disconnect(ws)
        pass
