import React from "react";
import "./Header.css";
import Logo from "/src/assets/MEDFLOW.png"; // Remplace par ton logo

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <img src={Logo} alt="MedFlow Logo" className="app-logo" />
        <h1 className="app-title"></h1>
      </div>
      
      
    </header>
  );
}
