import React, { useState } from "react";
import "./App.css";

const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

  const handleToggleForm = () => {
    setIsRegister(!isRegister);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!emailRegex.test(email)) {
      setErrorMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    const url = isRegister
      ? "http://localhost:5000/api/register"
      : "http://localhost:5000/api/login";

    const data = { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(responseData.error || "Une erreur s'est produite.");
      } else {
        setSuccessMessage(responseData.message);

        if (isRegister) {
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setTimeout(() => {
            setIsRegister(false); // Passer en mode connexion après inscription
            setSuccessMessage(""); // Effacer le message après la transition
          }, 2000);
        } else {
          // Si l'utilisateur est en mode connexion, redirection vers Google
          window.location.href = "https://www.google.com";
        }
      }
    } catch (error) {
      setErrorMessage("Une erreur s'est produite lors de l'envoi de la requête.");
    }
  };

  return (
    <div className="auth-container">
      <a className="toggle-link" onClick={handleToggleForm}>
        {isRegister ? "Déjà un compte ? Se connecter" : "Créer un compte"}
      </a>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isRegister ? "S'enregistrer" : "Se connecter"}</h2>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {isRegister && (
          <input type="password" placeholder="Confirmer le mot de passe" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        )}
        <button type="submit">{isRegister ? "S'inscrire" : "Connexion"}</button>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </form>
    </div>
  );
};

export default AuthForm;
