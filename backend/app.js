const express = require('express');
const bodyParser =require('body-parser');
const mongoose = require ('mongosse');

const app = express();

mongoose.connect('mongodb+srv://lucioleSan:bxc36gz@cluster0.bzplbgf.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());

module.exports = app;