const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const validator = require('validator'); 
const User = require('../models/User');

// Fonction pour l'inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    const email = req.body.email;
    
    if (!validator.isEmail(email)) {
        
        return res.status(400).json({ message: 'Adresse e-mail invalide' });
    }

    
    bcrypt.hash(req.body.password, 10) 
      .then(hash => {
        
        const user = new User({
          email: req.body.email,
          password: hash
        });
        
        user.save()
          
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          
          .catch(error => res.status(400).json({ error }));
      })
      // En cas d'erreur lors du hashage, renvoie une réponse 500 avec l'erreur
      .catch(error => res.status(500).json({ error }));
};

// Fonction pour la connexion d'un utilisateur
exports.login = (req, res, next) => {
    
    User.findOne({ email: req.body.email })
        .then(user => {
            
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            "RANDOM_TOKEN_SECRET", 
                            { expiresIn: '24h'} 
                        )
                    });
                })
                
                .catch(error => res.status(500).json({ error }));
        })
        
        .catch(error => res.status(500).json({ error }));
};