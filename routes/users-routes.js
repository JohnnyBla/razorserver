const express = require('express');
const User = require('../models/users');
const passport = require('passport');
const nodemailer = require('nodemailer');
const emailText = require('../util/emailService');
const authenticate = require('../authenticate');
const config = require('../config');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: config.mailer.service,
  auth: {
    user: config.mailer.user,
    pass: config.mailer.pass,
  },
});

// resetPassword function

router.put('/', (req, res, next) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      user.setPassword(req.body.password, () => {
        user.save();

        const mailOptions = {
          from: emailText.emailaddress,
          to: user.email,
          subject: 'Password Change Successfully!',
          html: `<h2>${user.username}</h2>${emailText.informationChange}`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        res.statusCode = 200;
        res.json('Password Reset Successful');
      });
    } else {
      const err = new Error('Invalid Email');
      err.status = 500;
      return next(err);
    }
  });
});

// sign up request
router.post('/signup', (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((ExisitingUser) => {
      if (ExisitingUser) {
        res.statusCode = 500;
        res.setHeader('Content-type', 'application/json');
        res.json({ message: 'Email Address already in use' });
      } else {
        User.register(
          new User({ username: req.body.username }),
          req.body.password,
          (err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              console.log(err);
              res.json(err);
            } else {
              console.log(req.body.email);
              if (req.body.firstname) {
                user.firstname = req.body.firstname;
              }
              if (req.body.lastname) {
                user.lastname = req.body.lastname;
              }
              if (req.body.email) {
                user.email = req.body.email;
              }
              const mailOptions = {
                from: emailText.emailaddress,
                to: req.body.email,
                subject: 'Thank You For signing up!',
                html: `<h2>${req.body.username}</h2>${emailText.registerText}`,
              };

              user.save((err) => {
                if (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({ err: err });
                  return;
                }
                passport.authenticate('local')(req, res, () => {
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({
                    success: true,
                    status: 'Registration Successful!',
                  });
                });
              });
            }
          }
        );
      }
    })
    .catch((err) => {
      return next(err);
    });
});

// login functions

router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id });
  const username = req.user.username;
  const userid = req.user.id;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    token: token,
    username: username,
    userid: userid,
    status: 'You are successfully logged in!',
  });
});

// google login functions

router.get(
  '/google/token',
  passport.authenticate('google', { scope: ['profile'] }),
  (req, res) => {
    console.log(req);
    if (req.user) {
      const token = authenticate.getToken({ id: req.user._id });
      const username = req.user.username;
      const userid = req.user.id;
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        token: token,
        username: username,
        userid: userid,
        status: 'You are successfully logged in!',
      });
    }
  }
);

router.get(
  '/google/token/redirect',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users');
  }
);

// logout function

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});

// routers for password reset handlings

module.exports = router;
