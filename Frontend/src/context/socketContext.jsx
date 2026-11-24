/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";
import { getBackendOrigin } from "../utils/apiOrigin";

const BACKEND_ORIGIN = getBackendOrigin();

const SocketContext = createContext({ socket: null });

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    if (!user) {
      return;
    }

    const token = localStorage.getItem("token");

    const newSocket = io(BACKEND_ORIGIN, {
      withCredentials: true,
      ...(token ? { auth: { token: `Bearer ${token}` } } : {}),
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export default SocketContext;