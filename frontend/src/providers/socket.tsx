import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { NEXT_PUBLIC_SOCKET_API_URL } from "@/constant/env";
import useUser from "@/hooks/useUser";

const SocketContext = createContext<Socket<any> | null>(null);

export const useSocket = (): Socket<any> | null => {
  const socket = useContext(SocketContext);
  return socket;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<any> | null>(null);
  const user = useUser();

  useEffect(() => {
    if (!user?.me) return;

    if (socket?.connected) return;
    
    const newSocket = io(NEXT_PUBLIC_SOCKET_API_URL, {
      query: {
        userId: user.me._id,
      },
      timeout: 5000, // 5 second timeout
      transports: ['websocket', 'polling'], // Try WebSocket first, then polling
    });

    // Handle connection events
    newSocket.on('connect', () => {
      
    });

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      // Don't show error to user if it's a blocked connection
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        
      }
    });

    newSocket.on('disconnect', (reason) => {
     
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.me?._id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
