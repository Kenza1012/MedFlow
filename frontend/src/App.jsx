import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home"; // Nouvelle page Home
import MedecinDashboard from "./pages/medecin/MedecinDashboard";
import PatientDashboard from "./pages/patient/patientDashboard";
import ReceptionDashboard from "./pages/receptionniste/ReceptionDashboard";
import Layout from "./components/Layout"; // Layout commun avec header/footer

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
        {/* Ici tu peux ajouter d'autres dashboards ou pages spécifiques */}
      </Routes>
    </Router>
  );
}

export default App;
