import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, finishInitializing } from "../features/auth/authSlice";
import { setAccessToken, axiosInstance, registerLogoutHandler } from "../lib/axios";
import { clearCredentials } from "../features/auth/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    registerLogoutHandler(() => dispatch(clearCredentials()));

    const bootstrap = async () => {
      try {
        const { data } = await axiosInstance.post("/auth/refresh");
        setAccessToken(data.data.accessToken);
        dispatch(setCredentials({ user: data.data.user }));
      } catch (err) {
        dispatch(finishInitializing());
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
};

export default AuthInitializer;
