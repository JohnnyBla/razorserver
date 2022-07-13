const express = require('express');
const passport = require('passport');


const Load = require('../models/load');
const User = require('../models/users');

const authenticate = require('../authenticate');
const HttpError = require('../models/http-error');

const loadRouter = express.Router();

// get user loads by user id

loadRouter
  .route('/user/:uid')
  .get(async (req, res, next) => {
    const userId = req.params.uid;

    Load.find({ user: userId })
      .then((load) => {
        if (load.length !== 0) {
          User.findById(userId)
            .populate('loads')
            .then((response) => {
              const userLoads = response.loads;
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.send(userLoads.map((load) => load));
            })
            .catch((err) => next(err));
        } else {
          return next(new HttpError('no loads to display'), 404);
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.params.uid)
      .then((user) => {
        if (user.loads.length !== 0) {
          user.loads = [];
          user.save();
          Load.deleteMany({ user: user.id })
            .then((load) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(load);
            })
            .catch((err) => next(err));
        } else {
          err = new HttpError('No loads found', 404);
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

// post loads

loadRouter.route('/').post(authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user.id)
    .populate('loads')
    .then((user) => {
      if (req.body) {
        req.body.user = req.user.id;        
        const createdLoad = new Load(req.body);
        user.loads.push(createdLoad);
        user
          .save()
          .then(createdLoad.save())
          .then((user) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user);
          })
          .catch((err) => next(err));
      } else {
        err = new Error(`User ${req.user.id} not found`);
        err.status = 400;

        return next(err);
      }
    })
    .catch((err) => next(err));
});

// handled loads by load id

loadRouter
  .route('/:lid')
  .get((req, res, next) => {
    const loadId = req.params.lid;
    Load.findById(loadId)
      .then((load) => {
        if (load === undefined || load === null) {
          return next(new HttpError(`could not find loads for ${loadId}`), 404);
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(load);
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    const loadId = req.params.lid;
    Load.findById(loadId)
      .populate('user')
      .then((load) => {
        if (load) {
          load.user.loads.pull(load);
          load.user.save();
          Load.deleteOne(load)
            .then((load) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(load);
            })
            .catch((err) => next(err));
        } else {
          err = new HttpError('No Load Found', 404);
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = loadRouter;
