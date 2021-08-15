const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes:0,
    dislikes:0,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () =>{
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
    })
  })
  .catch(error => res.status(500).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
        .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};
exports.likeSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const userId = req.body.userId
    const userWantsToLike = (req.body.like === 1)
    const userWantsToCancel = (req.body.like === 0)
    const userWantsToDislike = (req.body.like === -1)
    const userCanLike = (!sauce.usersDisliked.includes(userId) || sauce.usersLiked.includes(userId))
    const userCanDislike = (!sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId))
    const notFirstVote = (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId))
    // user like:
    if (userWantsToLike && userCanLike) {
      sauce.usersLiked.push(userId)
    }
    // user dislike:
    if (userWantsToDislike && userCanDislike) {
      sauce.usersDisliked.push(userId)
    }
    // user cancel:
    if (userWantsToCancel && notFirstVote) {
      if (sauce.usersLiked.includes(userId)){
        let key = sauce.usersLiked.indexOf(userId)
        sauce.usersLiked.splice(key, 1)
      }
      else {
        let key = sauce.usersDisliked.indexOf(userId)
        sauce.usersDisliked.splice(key, 1)
      }
    }
    sauce.likes = sauce.usersLiked.length
    sauce.dislikes = sauce.usersDisliked.length
    const updatedSauce = sauce
    updatedSauce.save()
    return updatedSauce
  })
  .then(sauce => res.status(200).json({ message: 'Objet modifié !', sauce}))
  .catch(error => res.status(400).json({ error, message: "une erreure!!!" }))
  .catch(error => res.status(500).json({ error }));
};  