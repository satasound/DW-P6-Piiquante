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
//  *******************   MODIFY  *******************
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
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
          }
        : { ...req.body };

      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        //.catch(error => res.status(400).json({ error }));
        .catch((error) => res.status(400).json(error.message));
    })
    .catch((error) => res.status(400).json(error.message));
};

/*************************************************
 *******************   MODIFY 2  *******************
 ************************************************/
// exports.modifySauce = (req, res, next) => {
//   const sauceObject = req.file
//     ? {
//         ...JSON.parse(req.body.sauce),
//         imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
//       }
//     : { ...req.body };
//   Thing.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
//     .then(() => res.status(200).json({ message: 'Objet modifié !' }))
//     .catch((error) => res.status(400).json({ error }));
// };

/*************************************************
 *******************   DELETE  *******************
 ************************************************/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      // si le userId de la sauce n'est pas le même que celui du token de connexion
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({
          error: new Error('Requette non autorisée !'),
        });
      }

      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

/*************************************************
 *******************   LIKES  *******************
 ************************************************/
// exports.likeStatus = (req, res, next) => {
//   console.log(req.body);

//   switch (req.body.like) {
//     // Si l'utilisateur supprime son opinion
//     case 0:
//       Sauce.findOne({ _id: req.params.id })
//         .then((sauce) => {
//           // Si l'utilisateur avait liké la Sauce
//           if (sauce.usersLiked.find((user) => user === req.body.userId)) {
//             Sauce.updateOne(
//               { _id: req.params.id },
//               {
//                 // utilisations des variables $inc et $pull de mongodb pour mettre à jour
//                 // Décrémenter de 1 les likes
//                 $inc: { likes: -1 },

//                 // Retirer l'ID de l'utilisateur du tableau des liked
//                 $pull: { usersLiked: req.body.userId },
//                 _id: req.params.id,
//               }
//             )
//               .then(() => res.status(201).json({ message: 'Ton avis a été pris en compte!' }))
//               .catch((error) => res.status(400).json({ error }));
//           }

//           // Si l'utilisateur avait disliké la Sauce
//           if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
//             Sauce.updateOne(
//               { _id: req.params.id },
//               {
//                 // utilisations des variables $inc et $pull de mongodb pour mettre à jour
//                 // Décrémenter de 1 les dislikes
//                 $inc: { dislikes: -1 },

//                 // Retirer l'ID de l'utilisateur du tableau des disliked
//                 $pull: { usersDisliked: req.body.userId },
//                 _id: req.params.id,
//               }
//             )
//               .then(() => res.status(201).json({ message: 'Ton avis a été pris en compte!' }))
//               .catch((error) => res.status(400).json({ error }));
//           }
//         })
//         .catch((error) => res.status(404).json({ error }));
//       break;

//     // Si l'utilisateur like la Sauce
//     case 1:
//       // met à jour la sauce dans la base de données selon l'_id de la sauce
//       Sauce.updateOne(
//         { _id: req.params.id },
//         {
//           // utilisations des variables $inc et $push de mongodb pour mettre à jour
//           // Incrémenter de 1 les likes
//           $inc: { likes: 1 },

//           // Ajouter l'ID de l'utilisateur au tableau des liked
//           $push: { usersLiked: req.body.userId },
//           _id: req.params.id,
//         }
//       )
//         .then(() => res.status(201).json({ message: 'Ton like a été pris en compte !' }))
//         .catch((error) => res.status(400).json({ error }));
//       break;

//     // Si l'utilisateur dislike la Sauce
//     case -1:
//       // met à jour la sauce dans la base de données selon l'_id de la sauce
//       Sauce.updateOne(
//         { _id: req.params.id },
//         {
//           // utilisations des variables $inc et $push de mongodb pour mettre à jour
//           // Incrémenter de 1 les disliked
//           $inc: { dislikes: 1 },

//           // Ajouter l'ID de l'utilisateur au tableau des disliked
//           $push: { usersDisliked: req.body.userId },
//           _id: req.params.id,
//         }
//       )
//         .then(() => res.status(201).json({ message: 'Ton dislike a été pris en compte !' }))
//         .catch((error) => res.status(400).json({ error }));
//       break;

//     // Si la valeur attendu n'est pas correcte
//     default:
//       console.error("Cette valeur n'est pas valide !");
//   }
// };

/*************************************************
 *******************   LIKES 2  *******************
 ************************************************/
// exports.likeStatus = (req, res, next) => {
//   console.log(req.body);

//   Sauce.findOne({ _id: req.params.id })
//     .then((sauce) => {
//       // Si user n'a pas déja "liké"  && like = 1
//       if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
//         Sauce.updateOne(
//           { _id: req.params.id },
//           {
//             $inc: { likes: 1 },
//             $push: { usersLiked: req.body.userId },
//           }
//         )
//           .then(() => res.status(201).json({ message: 'Il a été noté que vous aimez cette sauce!' }))
//           .catch((error) => res.status(400).json({ error }));
//       }
//       // Si user a déja "liké"  && like = 0 (= user a changé d'avis)
//       if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
//         Sauce.updateOne(
//           { _id: req.params.id },
//           {
//             $inc: { likes: -1 },
//             $pull: { usersLiked: req.body.userId },
//           }
//         )
//           .then(() => res.status(201).json({ message: 'Aucun vote!' }))
//           .catch((error) => res.status(400).json({ error }));
//       }
//       // Si user a déja "disliké"  && like = 1 (= user a changé d'avis)
//       if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
//         Sauce.updateOne(
//           { _id: req.params.id },
//           {
//             $inc: { dislikes: 1 },
//             $push: { usersDisliked: req.body.userId },
//           }
//         )
//           .then(() => res.status(201).json({ message: "Il a été noté que vous n'aimez pas cette sauce!" }))
//           .catch((error) => res.status(400).json({ error }));
//       }
//       // Après un dislike remettre like à 0
//       if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
//         Sauce.updateOne(
//           { _id: req.params.id },
//           {
//             $inc: { dislikes: -1 },
//             $pull: { usersDisliked: req.body.userId },
//           }
//         )
//           .then(() => res.status(201).json({ message: 'Aucun vote!' }))
//           .catch((error) => res.status(400).json({ error }));
//       }
//     })
//     .catch((error) => res.status(404).json({ error }));
// };

/*************************************************
 *******************   LIKES 3  *******************
 ************************************************/
// exports.likeSauce = (req, res, next) => {
//   const userId = req.body.userId;
//   const like = req.body.like;
//   const sauceId = req.params.id;
//   Sauce.findOne({ _id: sauceId })
//     .then((sauce) => {
//       // nouvelles valeurs à modifier
//       const newValues = {
//         usersLiked: sauce.usersLiked,
//         usersDisliked: sauce.usersDisliked,
//         likes: 0,
//         dislikes: 0,
//       };
//       // Différents cas:
//       switch (like) {
//         case 1: // CAS: sauce liked
//           newValues.usersLiked.push(userId);
//           break;
//         case -1: // CAS: sauce disliked
//           newValues.usersDisliked.push(userId);
//           break;
//         case 0: // CAS: Annulation du like/dislike
//           if (newValues.usersLiked.includes(userId)) {
//             // si on annule le like
//             const index = newValues.usersLiked.indexOf(userId);
//             newValues.usersLiked.splice(index, 1);
//           } else {
//             // si on annule le dislike
//             const index = newValues.usersDisliked.indexOf(userId);
//             newValues.usersDisliked.splice(index, 1);
//           }
//           break;
//       }
//       // Calcul du nombre de likes / dislikes
//       newValues.likes = newValues.usersLiked.length;
//       newValues.dislikes = newValues.usersDisliked.length;
//       // Mise à jour de la sauce avec les nouvelles valeurs
//       Sauce.updateOne({ _id: sauceId }, newValues)
//         .then(() => res.status(200).json({ message: 'Sauce notée !' }))
//         .catch((error) => res.status(400).json({ error }));
//     })
//     .catch((error) => res.status(500).json({ error }));
// };
