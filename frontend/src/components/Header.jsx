import React from "react";
import "./Header.css";
import logo from "/src/assets/logo.png"; // Remplace par ton logo

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <img src={logo} alt="MedFlow Logo" className="app-logo" />
        <h1 className="app-title">MedFlow</h1>
      </div>
      
      
    </header>
  );
}
