const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
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
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
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
exports.likeSauce = (req, res, next) => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce)
      } : { ...req.body };
    let instance = { _id: req.params.id }
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        let likes = sauce.likes
        let dislikes = sauce.dislikes
        let usersLiked = sauce.usersLiked
        let usersDisliked = sauce.usersDisliked
        if (sauceObject.like == 1) {
            likes = likes + 1
            usersLiked = usersLiked + sauceObject.userId
            let fields = { $set: {likes: likes, usersLiked: usersLiked}}
        }
        else if (sauceObject.like == -1){
            dislikes = dislikes + 1
            usersDisliked = usersDisliked + sauceObject.userId
            let fields = { $set: {dislike: dislikes, usersDisliked: usersDisliked}}
        }
        // let fields = { ...sauceObject, _id: req.params.id }
        Sauce.updateOne(instance, fields)
        .then(() => res.status(200).json({ message: 'Objet modifié !', sauceObject}))
        .catch(error => res.status(400).json({ error }))
        .catch(error => res.status(500).json({ error }));
    });
};  