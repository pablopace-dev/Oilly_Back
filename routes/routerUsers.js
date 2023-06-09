const express = require('express');
const router = express.Router();

const { check } = require('express-validator');
const { validateInputs } = require('../middlewares/validateInputs');

const {
    createUser,
    getUsers,
    updateUser,
    getUserByEmail,
    loginUser,
    validateJWT
} = require('../controllers/controllerUsers');

router.get('/', getUsers);


router.get('/:email', getUserByEmail);


router.post('/login', loginUser);


router.post('/renew/', validateJWT);


router.post('/', [
    check('name', 'El nombre es obligatorio.').trim().not().isEmpty(),
    check('last_name', 'El apellido es obligatorio.').trim().not().isEmpty(),
    check('password', 'La contraseña es obligatoria y debe tener entre 8 y 12 caracteres, números, minúsculas, mayúsculas y al menos un caracter especial.').trim().isLength({ min: 8, max: 12 }).not().isEmpty(),
    check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail().normalizeEmail(),
    validateInputs
], createUser);


router.put('/:id', [
    check('name', 'El nombre es obligatorio.').trim().not().isEmpty(),
    check('last_name', 'El apellido es obligatorio.').trim().not().isEmpty(),
    check('password', 'La contraseña es obligatoria y debe tener entre 8 y 12 caracteres, números, minúsculas, mayúsculas y al menos un caracter especial.').trim().isLength({ min: 8, max: 12 }).not().isEmpty(),
    check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail().normalizeEmail(),
    validateInputs
], updateUser);


module.exports = router;