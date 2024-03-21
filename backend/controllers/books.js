const Book = require('../models/Book');
const fs = require('fs');

// Création d'un livre 
exports.createBook = (req, res, next) => {
  
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  
  let averageRating = bookObject.averageRating ? bookObject.averageRating : 0;
  
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
     
  });
  
  book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => res.status(400).json({ error, message: 'Erreur lors de la sauvegarde du livre' }));
};


exports.updateBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  
  Book.findOne({ _id: req.params.id })
      .then((book) => {
          if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
          if (book.userId != req.auth.userId) return res.status(401).json({ message: 'Pas autorisé' });
          
          // Mise à jour de l'objet livre avec les nouvelles données
          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Livre modifié!' }))
              .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(400).json({ error }));
};

// Suppression d'un livre 
exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
      .then((book) => {
          if (book.userId != req.auth.userId) return res.status(401).json({ message: 'Pas autorisé' });
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
              Book.deleteOne({ _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Livre supprimé!' }))
                  .catch(error => res.status(400).json({ error }));
          });
      })
      .catch(error => res.status(400).json({ error }));
};

// Récupération d'un livre 
exports.getBookById = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Récupération de tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

// Notation d'un livre par un utilisateur
exports.rateBook = (req, res) => {
  const grade = parseFloat(req.body.rating);
  if (isNaN(grade) || grade < 0 || grade > 5) return res.status(400).json({ message: 'La note est invalide.' });
  
  Book.findOne({ _id: req.params.id })
      .then(book => {
          if (!book) throw new Error('Livre non trouvé!');
          const userRating = book.ratings.find(rating => rating.userId.toString() === req.auth.userId);
          if (userRating) throw new Error('Vous avez déjà noté ce livre.');
          
          book.ratings.push({ userId: req.auth.userId, grade });
          book.averageRating = Math.round(book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length);
          return book.save();
      })
      .then(updatedBook => res.status(200).json(updatedBook))
      .catch(error => {
          let status = 400;
          if (error.message.includes('non trouvé')) status = 404;
          if (error.message.includes('déjà noté')) status = 403;
          res.status(status).json({ message: error.message || error });
      });
};

// Récupération des livres les mieux notés
exports.getBestRatedBooks = (req, res) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
      .then(books => res.status(200).send(books))
      .catch(error => res.status(500).json({ error }));
};