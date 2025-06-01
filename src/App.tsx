import { useEffect } from "react";
import { HashRouter, Route, Routes, useNavigate, Navigate, Outlet } from 'react-router-dom';
import LoginPage from "./presentation/pages/LoginPage";
import DashboardPage from "./presentation/pages/DashboardPage";
import { ServerListPage } from "./presentation/pages/ServerListPage";
import { setNavigate } from "./infrastructure/navigation/RouterService";
import { useAuth } from "./presentation/hooks/useAuth";
import { CircularProgress, Box } from "@mui/material"; // For loading indicator

// Component to initialize RouterService
const NavigateSetter = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null; // This component doesn't render anything
};

// ProtectedRoute component
const ProtectedRoute = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading spinner or some placeholder while checking auth state
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    // If not loading and no user, redirect to login page
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Render the child route (DashboardPage, ServerListPage)
};

const App = () => {
  // The old loggedIn state and setLoggedInState function are removed, useAuth handles this.
  // useEffect(() => {
  //   setLoggedInState(); // Old logic
  // }, []);

  // function setLoggedInState() { // Old logic
  //   const user = localStorage.getItem("user") || "true"
  //   if (user == "true") {
  //     setLoggedIn(true);
  //   } else {
  //     setLoggedIn(false);
  //   }
  //   console.log("logged in state: " + loggedIn);
  // }

  // useAuth will manage currentUser state and loading state internally
  // No need for explicit loggedIn state here anymore.

  return (
    <HashRouter>
      <NavigateSetter /> {/* Initialize RouterService */}
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/serverList" element={<ServerListPage />} />
        </Route>

        {/* Fallback route can be added here if needed, e.g., redirect to / or a 404 page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
export default App;
