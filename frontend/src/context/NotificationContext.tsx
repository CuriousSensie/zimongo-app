// import { createContext, use, useContext, useEffect, useState } from "react";
// import Api from "@/lib/api";
// import { useSocket } from "@/providers/socket";
// import useUser from "@/hooks/useUser";

// interface NotificationCount {
//   total: number;
//   certification: number;
//   compliance: number;
//   approval: number;
//   system: number;
// }

// interface NotificationContextType {
//   notificationCount: NotificationCount | null;
//   loading: boolean;
//   error: string;
//   refresh: () => void;
// }

// const NotificationContext = createContext<NotificationContextType | null>(null);

// export const NotificationProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const socket = useSocket();
//   const { me } = useUser() || {};

//   const isAdmin = me?.isAdmin;

//   const [notificationCount, setNotificationCount] =
//     useState<NotificationCount | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [refetch, setRefetch] = useState(0);

//   const fetchNotificationCount = async () => {
//     try {
//       if (!me) {
//         setNotificationCount(null);
//         return;
//       }
//       setLoading(true);
//       const {
//         data: { unreadCount },
//       } = isAdmin
//         ? await Api.getUnreadNotificationsCount()
//         : await Api.getMyUnreadNotificationsCount();
//       setNotificationCount(unreadCount);
//     } catch (err) {
//       setError((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refresh = () => setRefetch((prev) => prev + 1);

//   useEffect(() => {
//     fetchNotificationCount();
//   }, [refetch, isAdmin]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleNotificationUpdate = () => {
//       fetchNotificationCount();
//     };

//     socket.on("activity", handleNotificationUpdate);
//     return () => {
//       socket.off("activity", handleNotificationUpdate);
//     };
//   }, [socket]);

//   return (
//     <NotificationContext.Provider
//       value={{ notificationCount, loading, error, refresh }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotification = () => {
//   const ctx = useContext(NotificationContext);
//   if (!ctx)
//     throw new Error("useNotification must be used within NotificationProvider");
//   return ctx;
// };
