import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  //  Chemins corrigés : tes images doivent être dans "public/assets/images/"
  const images = [ "src/bg1.jpg", "src/bg2.jpg", "src/bg3.jpg", "src/bg4.jpg", "src/bg10.jpg", ];

  const messages = [
    "Prenez soin de vos patients avec simplicité.",
    "Gérez vos rendez-vous sans stress.",
    "Modernisez votre pratique médicale.",
    "MedFlow, votre allié santé au quotidien.",
  ];

  //  Changement d’image + texte toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="home-container">
      {images.map((img, index) => (
        <div
          key={index}
          className={`bg-image ${index === currentIndex ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        ></div>
      ))}

      <div className="overlay">
        <div className="home-content">
          <h1>
            Bienvenue sur <span className="highlight">MedFlow</span>
          </h1>

          {/* ✅ Texte dynamique animé */}
          <p key={currentIndex} className="animated-text">
            {messages[currentIndex]}
          </p>

          <button className="start-btn" onClick={() => navigate("/login")}>
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}
