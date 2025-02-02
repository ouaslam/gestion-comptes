const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('./User');
require('dotenv').config();

const router = express.Router();

// Configuration Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Ton adresse email
    pass: process.env.EMAIL_PASS, // Mot de passe d'application (Gmail) ou mot de passe SMTP
  },
});

// Fonction pour envoyer l'email de vérification
async function sendVerificationEmail(email, verificationLink) {
  try {
    await transporter.sendMail({
      from: `"Votre App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Vérification de compte",
      text: `Cliquez sur le lien pour vérifier votre compte : ${verificationLink}`,
      html: `<p>Cliquez sur le lien ci-dessous pour vérifier votre compte :</p>
             <a href="${verificationLink}">${verificationLink}</a>`,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email: ", error);
    throw new Error("Erreur d'envoi de l'email.");
  }
}

// Inscription
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "L'email est déjà utilisé." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash: hashedPassword, is_verified: false });

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `http://localhost:5000/api/verify/${token}`;

    await sendVerificationEmail(email, verificationLink);
    
    res.status(200).json({ message: 'Inscription réussie. Vérifiez votre email.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Vérification de compte
// Vérification de compte avec update()
// Vérification de compte
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: "Le compte est déjà vérifié." });
    }

    // Update verification status
    await User.update({ is_verified: true }, { where: { email: decoded.email } });

    // After successful verification, send the redirect
    return res.redirect('http://localhost:3000');  // Ensure this is the last action

  } catch (error) {
    return res.status(400).json({ error: 'Lien de vérification invalide.' });
  }
});

// Connexion (login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: "L'utilisateur n'existe pas." });

    if (!user.is_verified) {
      return res.status(400).json({ error: "Veuillez vérifier votre compte avant de vous connecter." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect." });
    }

    // Création du token JWT avec email et ID
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Connexion réussie.', token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});
module.exports = router;
