const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Créer le middleware multer pour le téléchargement d'images
const upload = multer({ storage: storage }).single('image');

// Middleware pour optimiser l'image après le téléchargement
const optimizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const originalImagePath = path.join('images', req.file.filename);
  const optimizedImagePath = path.join('images', 'optimized_' + req.file.filename.split('.').slice(0, -1).join('.') + '.webp');

  sharp(originalImagePath)
    .resize(800) 
    .toFormat('webp', { quality: 80 })
    .toFile(optimizedImagePath, (err) => {
      if (err) {
        console.error("Sharp error:", err);
        return next(err);
      }

      // Optionnel : Supprimer l'image originale
      fs.unlink(originalImagePath, err => {
        if (err) console.error("Failed to delete original image:", err);
        // Mise à jour du chemin de fichier dans req.file pour refléter l'image optimisée
        req.file.path = optimizedImagePath;
        req.file.filename = path.basename(optimizedImagePath);
        next();
      });
    });
};

// Exportation des middlewares

module.exports.upload = upload;
module.exports.optimizeImage = optimizeImage;