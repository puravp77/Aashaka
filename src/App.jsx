import { Routes, Route } from "react-router-dom";
import StoreApp from "./StoreApp";
import AdminApp from "./AdminApp";
import MaintenancePage from "./pages/content/MaintenancePage";
import { useSettings } from "./context/SettingsContext";
import { useAuth } from "./context/AuthContext";
import "./index.css";

function App() {
   const { settings } = useSettings();
   const { user } = useAuth();

   // If maintenance mode is ON and user is NOT an admin, show maintenance page
   // But ALWAYS allow access to /admin routes for management
   const isMaintenance = settings.maintenanceMode;
   const isAdmin = user?.role === 'admin';

   return (
      <Routes>
         <Route path="/admin/*" element={<AdminApp />} />
         <Route
            path="*"
            element={
               isMaintenance && !isAdmin ? <MaintenancePage /> : <StoreApp />
            }
         />
      </Routes>
   );
}

export default App;
