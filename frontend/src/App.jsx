import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard_page";
import Login from "./pages/Login_page";
import Prezente from "./pages/Prezente_page";
import Statistici from "./pages/Statistici_page";
import Studenti from "./pages/Studenti_page";
import Setari from "./pages/Setari_page";
import SocketPage from "./pages/Socket_page";



export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL /* => /smart-tag/ în prod, / în dev */}>
      <Routes>
        {/* redirect root către login (ca să nu fie ”/” pagina de login) */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login pe /login */}
        <Route path="/login" element={<Login />} />

        {/* Pagini */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prezente" element={<Prezente />} />
        <Route path="/statistici" element={<Statistici />} />
        <Route path="/studenti" element={<Studenti />} />
        <Route path="/setari" element={<Setari />} />
        <Route path="/socket-test" element={<SocketPage />} />

        <Route path="*" element={<h1 className="p-6">404 - Pagina nu există</h1>} />
      </Routes>
    </Router>
  );
}