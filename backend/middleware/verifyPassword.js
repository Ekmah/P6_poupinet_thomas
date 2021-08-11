const passwordValidator = require('password-validator')

const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)
.is().max(100)
.has().digits()
.has().not().spaces()

module.exports = passwordSchema

module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        res.status(400).json({ error: 'mot de passe trop simple' });
    }
    else {
        next();
    }
}