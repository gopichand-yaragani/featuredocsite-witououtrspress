
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Handle redirect from 404.html for GitHub Pages
// This ensures React Router can handle the deep URL
// This MUST run synchronously before React renders to ensure correct URL is available
(function() {
  if (sessionStorage.redirect) {
    try {
      const redirectUrl = new URL(sessionStorage.redirect);
      const redirectPath = redirectUrl.pathname;
      // Update the browser URL to the original path (without triggering a reload)
      // This allows React Router to handle the route correctly
      if (window.location.pathname !== redirectPath) {
        window.history.replaceState(null, '', redirectPath + redirectUrl.search + redirectUrl.hash);
      }
      // Clear the redirect flag after using it
      delete sessionStorage.redirect;
    } catch (e) {
      // If URL parsing fails, just clear the redirect
      console.warn('Failed to handle redirect:', e);
      delete sessionStorage.redirect;
    }
  }
})();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
  