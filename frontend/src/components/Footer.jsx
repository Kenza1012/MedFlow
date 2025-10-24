import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>© 2025 MedFlow. Tous droits réservés.</p>
      <div className="footer-links">
        <a href="/terms">Conditions</a>
        <a href="/privacy">Confidentialité</a>
        <a href="/contact">Contact</a>
      </div>
    </footer>
  );
}
