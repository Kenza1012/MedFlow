// 🔹 Décode un JWT et retourne le payload
export default function decodeJWT(token) {
  if (!token) return null;

  try {
    // Séparer le token en 3 parties : header.payload.signature
    const payload = token.split('.')[1];

    // Base64 → JSON
    const decodedPayload = atob(payload);

    return JSON.parse(decodedPayload);
  } catch (err) {
    console.error("Erreur decodeJWT :", err);
    return null;
  }
}
