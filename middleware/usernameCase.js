exports.usernameToLowerCase = (req, res, next) => {
  req.body.username = req.body.username.toLowerCase();
  return next();
};
