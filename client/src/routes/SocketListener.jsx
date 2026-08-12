import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { apiSlice } from "../features/api/apiSlice";
import { selectIsAuthenticated } from "../features/auth/authSlice";

/**
 * Mounted once near the app root. Opens a socket.io connection whenever the
 * user is authenticated and tears it down on logout. New notifications pushed
 * from the server trigger a toast and invalidate the Notification cache so
 * the bell icon updates instantly instead of waiting for the next poll.
 */
const SocketListener = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      dispatch(apiSlice.util.invalidateTags([{ type: "Notification", id: "LIST" }]));
      toast.message(notification.title, { description: notification.message });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [isAuthenticated, dispatch]);

  return null;
};

export default SocketListener;
