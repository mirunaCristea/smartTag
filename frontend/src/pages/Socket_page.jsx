import { socket } from "../lib/socket";
import { useEffect, useState } from "react";

export default function SocketPage() {
  const [events, setEvents] = useState([]);
  const [connError, setConnError] = useState(null);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setConnError(null);
      console.log("connected:", socket.id);
    };

    const onDisconnect = (reason) => {
      setConnected(false);
      console.warn("disconnected:", reason);
    };

    const onConnectError = (err) => {
      // err e un obiect Error de la socket.io (are .message)
      setConnError(err?.message ?? String(err));
      console.warn("connect_error:", err?.message ?? err);
    };

    const onPrezenta = (ev) => {
      console.log("LIVE:", ev);
      setEvents((xs) => [ev, ...xs].slice(0, 50));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("prezenta_new", onPrezenta); // ✅ nume corect

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("prezenta_new", onPrezenta); // ✅ același nume
    };
  }, []);

  return (
    <div className="p-4">
      <h1>Socket Page</h1>

      <div className="mt-2 text-sm">
        <span className={connected ? "text-emerald-600" : "text-rose-600"}>
          {connected ? "Connected" : "Disconnected"}
        </span>
        {connError && (
          <span className="ml-2 text-rose-600">
            • error: {connError}
          </span>
        )}
      </div>

      <ul className="mt-3 space-y-2">
        {events.map((ev, i) => (
          <li key={i} className="rounded border p-2 text-sm">
            <div><b>ID:</b> {ev.id ?? "-"}</div>
            <div><b>Student:</b> {ev.student_id ?? "-"}</div>
            <div><b>Status:</b> {ev.status}</div>
            <div><b>TS:</b> {ev.timestamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
