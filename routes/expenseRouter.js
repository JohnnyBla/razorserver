const express = require('express');
const passport = require('passport');

const Expense = require('../models/expense');
const User = require('../models/users');

const authenticate = require('../authenticate');
const HttpError = require('../models/http-error');

const expenseRouter = express.Router();

// get user expense by user id

expenseRouter
  .route('/user/:uid')
  .get(async (req, res, next) => {
    const userId = req.params.uid;
    User.findById(userId)
      .populate('expenses')
      .then(async (response) => {
        const userExpenses = await response.expenses;
        if (!userExpenses || userExpenses.length === 0) {
          return next(
            new HttpError(`could not find expenses for ${userId}`, 404)
          );
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(userExpenses.map((expense) => expense));
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.params.uid)
      .then((user) => {
        if (user.expenses.length !== 0) {
          user.expenses = [];
          user.save();
          Expense.deleteMany({ user: user.id })
            .then((expense) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(expense);
            })
            .catch((err) => next(err));
        } else {
          err = new HttpError('No expenses found', 404);
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

// post expense

expenseRouter.route('/').post(authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user.id)
    .populate('expenses')
    .then((user) => {
      if (req.body) {
        req.body.user = req.user.id;
        const createExpense = new Expense(req.body);
        user.expenses.push(createExpense);

        user
          .save()
          .then(createExpense.save())
          .then((user) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user);
          })
          .catch((err) => next(err));
      } else {
        err = new Error(`$user ${req.user.id} not found`);
        err.status = 400;
        return next(err);
      }
    })
    .catch((err) => next(err));
});

expenseRouter
  .route('/:eid')
  .get(authenticate.verifyUser, (req, res, next) => {
    const expenseId = req.params.eid;
    Expense.findById(expenseId)
      .then((expense) => {
        if (expense === undefined || expense === null) {
          return next(
            new HttpError(`could not find expenses for ${expenseId}`),
            404
          );
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(expense);
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    const expenseId = req.params.eid;
    Expense.findById(expenseId)
      .populate('user')
      .then((expense) => {
        if (expense) {
          expense.user.expenses.pull(expense);
          expense.user.save();
          Expense.deleteOne(expense)
            .then((expense) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(expense);
            })
            .catch((err) => next(err));
        } else {
          err = new HttpError('No Expense Found', 400);
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = expenseRouter;
