import { useEffect, useState } from "react";
import useSocket from "../../hooks/useSocket";

export default function NotificationBell() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (data) => {
      setNotifications((prev) => [...prev, data]);
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  return (
    <button className="relative bg-gray-100 dark:bg-zinc-800 p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition">
      <span>🔔</span>
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
          {notifications.length}
        </span>
      )}
    </button>
  );
}