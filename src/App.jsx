import { Routes, Route } from "react-router-dom";
import StoreApp from "./StoreApp";
import AdminApp from "./AdminApp";
import "./index.css";

function App() {
   return (
      <Routes>
         <Route path="/admin/*" element={<AdminApp />} />
         <Route path="*" element={<StoreApp />} />
      </Routes>
   );
}

export default App;
