
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { registerServiceWorker } from "./app/utils/pushNotifications";

  createRoot(document.getElementById("root")!).render(<App />);

  // Register the service worker for web push notifications.
  // This only registers the SW; the actual push subscription (permission
  // prompt) is triggered separately when the user opts in via the UI.
  registerServiceWorker();
  