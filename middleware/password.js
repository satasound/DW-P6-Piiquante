const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

//Parametres de validation
passwordSchema.is().min(4).is().max(10).has().not().spaces().is().not().oneOf(['Passw0rd', 'Password123']);

module.exports = (req, res, next) => {
  if (passwordSchema.validate(req.body.password)) {
    next();
  } else {
    return res
      .status(400)
      .json({ error: `Le mot de passe n'est pas valide : ${passwordSchema.validate('req.body.password', { list: true })}` });
  }
};
