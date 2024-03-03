// Importation des modules nécessaires
const http = require('http'); // Importe le module HTTP natif de Node.js
const app = require('./app'); // Importe l'application Express depuis le fichier app.js

// Fonction pour normaliser le port sur lequel le serveur va écouter
const normalizePort = val => {
  const port = parseInt(val, 10); // Convertit la valeur en nombre

  if (isNaN(port)) {
    // Si la conversion échoue (pas un nombre), retourne la valeur d'origine
    return val;
  }
  if (port >= 0) {
    // Si le port est un nombre positif, le retourne
    return port;
  }
  return false; // Si le port est négatif, retourne false
};

// Définit le port en utilisant la fonction normalizePort
// Utilise la variable d'environnement PORT, sinon utilise 4000 par défaut
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port); // Définit le port dans l'application Express

// Gestionnaire d'erreur pour le serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    // Si l'erreur n'est pas liée à l'écoute du serveur, la relance
    throw error;
  }
  const address = server.address(); // Obtient l'adresse du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // Détermine le type de connexion
  switch (error.code) {
    case 'EACCES':
      // Gère les erreurs d'accès
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // Gère les erreurs d'adresse déjà utilisée
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      // Relance les autres types d'erreurs
      throw error;
  }
};

// Crée un serveur HTTP avec l'application Express
const server = http.createServer(app);

// Ajoute des gestionnaires d'événements pour le serveur
server.on('error', errorHandler); // Gère les erreurs
server.on('listening', () => {
  // Gère l'événement 'listening'
  const address = server.address(); // Obtient l'adresse du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; // Détermine le type de connexion
  console.log('Listening on ' + bind); // Affiche le message d'écoute
});

server.listen(port); // Lance le serveur sur le port spécifié