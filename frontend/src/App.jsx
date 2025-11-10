import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/register";
import Home from "./pages/Home"; // Nouvelle page Home
import MedecinDashboard from "./pages/medecin/MedecinDashboard";
import PatientDashboard from "./pages/patient/patientDashboard";
import Layout from "./components/Layout"; // notre Layout avec Header/Footer
import ReceptionDashboard from "./pages/receptionniste/ReceptionDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Home />} /> {/* Page d'accueil attractive */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages protégées avec Layout */}
        <Route
          path="/medecin/dashboard"
          element={
            <Layout>
              <MedecinDashboard />
            </Layout>
          }
        />
        <Route
          path="/patient/dashboard"
          element={
            <Layout>
              <PatientDashboard />
            </Layout>
          }
        />
        <Route
          path="/reception/dashboard"
          element={
            <Layout>
              <ReceptionDashboard />    
            </Layout>
          }
        />
        {/* Ajoute ici les autres dashboards */}
      </Routes>
    </Router>
  );
}

export default App;
