const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./db');
const authRoutes=require('./Routes')
const cors = require('cors');

require('dotenv').config();
console.log('MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY);
console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN);
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', authRoutes);

// Synchronisation des modèles
sequelize.sync().then(() => console.log('Base de données synchronisée.'));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}.`));
