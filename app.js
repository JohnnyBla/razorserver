// use heroku for the backend

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');

const passport = require('passport');

// Routers Import
// const formsRouter = require("./routes/forms-router");
const userRouter = require('./routes/users-routes');
const expenseRouter = require('./routes/expenseRouter');
const loadRouter = require('./routes/loadRouter');

// custom Http
const HttpError = require('./models/http-error');

const url = process.env.mongoUrl;
const app = express();

const connect = mongoose.connect(url).then(() => {
  app.listen(process.env.PORT || 5000);
});

connect.then(
  () => console.log('Connected to the server'),
  (err) => console.log(err)
);

// Secure traffic only

// view engine setup

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization,'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, PUT'
  );
  next();
});

// Secure traffic only
// app.all('*', (req, res, next) => {
//   if (req.secure) {
//     return next();
//   } else {
//     console.log(
//       `Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`
//     );
//     res.redirect(
//       301,
//       `https://${req.hostname}:${app.get('secPort')}${req.url}`
//     );
//   }
// });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

// using Routes


app.use('/api/loads', loadRouter);
app.use('/api/users', userRouter);
app.use('/api/expenses', expenseRouter);

// handle errors of no routes
app.use((req, res, next) => {
  return next(new HttpError('Could not find this route.', 404));
});

// catch 404 and forward to error handler
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || 'An unkown error occcured!' });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
