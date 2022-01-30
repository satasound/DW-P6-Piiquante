const Sauce = require('../models/sauce');
const fs = require('fs');

/*************************************************
 *******************   GET ALL  ******************
 ************************************************/
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
/*************************************************
 *******************   GET ONE  ******************
 ************************************************/
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};
/*************************************************
 *******************   CREATE  *******************
 ************************************************/
exports.createSauce = (req, res, next) => {
  // transformerla requête JSON en objet JS
  const sauceObject = JSON.parse(req.body.sauce);

  // suppresion du champ id de la requete.Il est généré par mongoose
  delete sauceObject._id;

  const sauce = new Sauce({
    //spread ... est utilisé pour faire une copie de tous les éléments de req.body
    ...sauceObject,
    // configuration de l'url de l'image
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });

  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};

// /*************************************************
//  *******************   UPDATE  *******************
//  ************************************************/
exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // si le userId de la sauce n'est pas le même que celui du token de connexion
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({
          error: new Error('Requette non autorisée !'),
        });
      }
      const sauceObject = req.file
        ? {
            ...JSON.parse(req.body.sauce),
            // configuration de l'url de l'image
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
          }
        : { ...req.body.sauce };

      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch((error) => res.status(400).json(error.message));
    })
    .catch((error) => res.status(400).json(error.message));
};

/*************************************************
 *******************   DELETE  *******************
 ************************************************/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //Extraire le nom du fichier à supprimer
      const filename = sauce.imageUrl.split('/images/')[1];
      // si le userId de la sauce n'est pas le même que celui du token de connexion
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({
          error: new Error('Requette non autorisée !'),
        });
      }
      //Supprimer l'image de la sauce
      fs.unlink(`images/${filename}`, () => {
        //supprimer la sauce
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};
