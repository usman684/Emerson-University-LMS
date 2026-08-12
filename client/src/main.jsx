import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { store } from "./app/store";
import { ThemeProvider } from "./context/ThemeContext";
import AuthInitializer from "./routes/AuthInitializer";
import SocketListener from "./routes/SocketListener";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthInitializer>
            <SocketListener />
            <App />
            <Toaster richColors position="top-right" />
          </AuthInitializer>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
