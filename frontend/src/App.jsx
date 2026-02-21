// frontend/src/App.jsx - Version mise à jour avec route Admin
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/register";
import Home from "./pages/Home"; // Nouvelle page Home
import MedecinDashboard from "./pages/medecin/MedecinDashboard";
import PatientDashboard from "./pages/patient/patientDashboard";
import ReceptionDashboard from "./pages/receptionniste/ReceptionDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RendezVousForm from "./pages/receptionniste/RendezVousForm";
import Layout from "./components/Layout";
import PaymentSuccess from "./pages/patient/PaymentSuccess";
import './styles/global.css'; // Importation des styles globaux

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
        <Route
          path="/admin/dashboard"
          element={
          <Layout>
            <AdminDashboard />
          </Layout>
          }
          // Route pour le dashboard Admin
        />
        // Dans ta configuration de routes :
        <Route path="/patient/payment-success" 
        element={
        <PaymentSuccess />
        } 
        />
        <Route
          path="/reception/rendezvous"
          element={
            <Layout>
              <RendezVousForm />
            </Layout>
          }
        />
         <Route
          path="/reception/rendezvous/new"
          element={
            <Layout>
              <RendezVousForm />
            </Layout>
          }
        />
        {/* Ajoute ici les autres dashboards */}
      </Routes>
    </Router>
  );
}

export default App;
