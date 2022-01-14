const Sauce = require('../models/sauce');

exports.likeStatus = (req, res, next) => {
  console.log(req.body);

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Si user n'a pas déja "liké"  && like = 1
      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: 'Il a été noté que vous aimez cette sauce!' }))
          .catch((error) => res.status(400).json({ error }));
      }
      // Si user a déja "liké"  && like = 0 (= user a changé d'avis)
      if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: 'Aucun vote!' }))
          .catch((error) => res.status(400).json({ error }));
      }
      // Si user a déja "disliké"  && like = 1 (= user a changé d'avis)
      if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: "Il a été noté que vous n'aimez pas cette sauce!" }))
          .catch((error) => res.status(400).json({ error }));
      }
      // Après un dislike remettre like à 0
      if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: 'Aucun vote!' }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(404).json({ error }));
};
