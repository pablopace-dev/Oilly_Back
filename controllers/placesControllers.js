const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { generateJwt, 
        renewToken } = require('../helpers/jwt')

const {
    getAllPlaces,
    getPlaceByPhone,
    createPlace,
    deletePlace,
    updatePlace,
    getAllRestaurants,
    modelGetPasswordByID
} = require('../models/placesModel')


//*Places CONTROLLERS

/**DOCS
 * Hace la consulta a la base de datos y devuelve todos los places.
 * @method getAllPlacesControl
 * @async
 * @param {Object} req Es el requerimiento de la ruta.
 * @param {Object} res Es la respuesta de la ruta.
 * @returns {jon} Con los places de la base de datos.
 * @throws {Error}
 */
//Get All Places ++++++++++
const getAllPlacesControl = async (req, res) => {

    let data;

    try {

        const petition = await getAllPlaces();
        data = petition.rows

        if (data) {

            return res.status(200).json({

                ok: true,
                msg: 'All places successfully found',
                data
            })
        }

    } catch (error) {

        return res.status(500).json({

            ok: false,
            msg: 'Model FAILED getting all places. Please, contact administrator.'
        })
    }
};


/**DOCS
 * Hace la consulta a la BBDD alojada en AWS proporcionada por DATA
 * y devuelve todos los restaurants. (establecimientos afiliados)
 * @method getAllRestaurantsControl
 * @async
 * @param {Object} req Es el requerimiento de la ruta.
 * @param {Object} res Es la respuesta de la ruta.
 * @returns {jon} Con los places de la base de datos.
 * @throws {Error}
 */
//Get All Restaurants ++++++++++
const getAllRestaurantsControl = async (req, res) => {

    let data;

    try {

        const petition = await getAllRestaurants();
        data = petition.rows

        if (data) {

            return res.status(200).json({

                ok: true,
                msg: 'All restaurants successfully found',
                data
            })
        }

    } catch (error) {

        return res.status(500).json({

            ok: false,
            msg: 'Model FAILED getting all restaurants. Please, contact administrator.'
        })
    }
};


/**DOCS
 * Hace la consulta a la base de datos y devuelve un single place, por teléfono que encuentre.
 * @method getPlaceByPhoneControl
 * @async
 * @param {Object} req Es el requerimiento de la ruta.
 * @param {Object} res Es la respuesta de la ruta.
 * @returns {jon} Con un place, con número de teléfono coincidente
 * @throws {Error}
 */
//Get place by phone +++++++
const getPlaceByPhoneControl = async (req, res) => {

    let data, phone;
    phone = req.params.phone;

    try {

        const petition = await getPlaceByPhone(phone)

        data = petition.rows

        if (phone) {

            return res.status(200).json({

                ok: true,
                msg: 'Single place gotten correctly',
                data
            })
        }

    } catch (error) {

        return res.status(500).json({

            ok: false,
            msg: 'Controller Failed getting single place. Please, contact administrator'
        })
    }
}


/**DOCS
 * Hace la consulta a la base de datos para crear una entrada "place".
 * Afilia un restaurant a la tabla places.
 * @method createPlaceControl
 * @async
 * @param {Object} req Es el requerimiento de la ruta.
 * Dentro del body debe tener los campos: place_name, address, coords, phone, contact_name, password.
 * @param {Object} res Es la respuesta de la ruta.
 * @returns {jon} Con los datos de un place creado.
 * @throws {Error}
 */
//Create place +++++++++
const createPlaceControl = async ({ body }, res) => {

    try {

        const petition = await createPlace(body)

        const placeCreated = petition.rows

        if (placeCreated) {

            return res.status(200).json({

                ok: true,
                msg: 'Single place created correctly',
                data: petition.rows[0]
            })
        }

    } catch (error) {

        if (error.toString().includes('duplicate key value')) {

            let err = { email: {} };
            err.email.msg = 'Este correo ya pertenece a un usuario registrado.'

            return res.status(500).json({
                ok: false,
                errors: err
            });
        }

        return res.status(500).json({

            ok: false,
            msg: 'Controller Failed creating place. Please, contact administrator'
        })
    }
}


/**DOCS
 * Hace la consulta a la base de datos para modificar los datos de una entrada "place".
 * @method updatePlaceControl
 * @async
 * @param {Object} req Es el requerimiento de la ruta. Recibe Body y place_id. Se captura de los params.
 * Dentro del body debe tener los campos: place_name, address, coords, phone, contact_name.
 * @param {Object} res Es la respuesta de la ruta.
 * @returns {jon} Con los datos de un place actualizado.
 * @throws {Error}
 */
//Update place +++++++++
const updatePlaceControl = async (req, res) => {

    let data, place_id, body;
    place_id = req.params.id;
    body = req.body;

    try {

        if (place_id) {

            const petition = await updatePlace(body, place_id)

            data = petition.rowCount

            return res.status(200).json({

                ok: true,
                msg: `Places updated: ${data}.`,
                data
            })
        }

    } catch (error) {

        return res.status(500).json({

            ok: false,
            msg: 'Control FAILED updating place. Please, contact administrator.'
        })
    }
}


/**DOCS
 * Hace la consulta a la base de datos para eliminar una entrada "place".
 * @method deletePlaceControl
 * @async
 * @param {Object} req Es el requerimiento de la ruta. Recibe el email que capturamos en los params.
 * @param {Object} res Es la respuesta de la ruta.
 * @returns {jon} Un ok:true si la petición es exitosa.
 * @throws {Error}
 */
//Delete place +++++++++
const deletePlaceControl = async (req, res) => {

    let data, email;
    email = req.params.email

    try {

        if (email) {

            const petition = await deletePlace(email)
            data = petition.rowCount

            return res.status(200).json({

                ok: true,
                msg: `Number of Places deleted: ${data}.`,
                data
            })
        }

    } catch (error) {

        return res.status(500).json({

            ok: true,
            msg: 'Controller FAILED deleting place. Please, contact administrator.'
        })
    }
}


/**DOCS
 * Devuelve todos los usuarios.
 * @method loginPlace
 * @async
 * @param {Object} req Es el requerimiento de la ruta, debe incluir en body: phone con el 
 * teléfono del establecimiento y password: con la contraseña.
 * @param {Object} res Es la respuesta de la ruta.
 * @returns {jon} Con el usuario de la base de datos.
 * @throws {Error}
 */
//Login place +++++++++
const loginPlace = async ({ body }, res) => {

    try {

        const data = await getPlaceByPhone(body.phone);

        if (data.rows == 0)
            return res.status(401).json({
                ok: false,
                msg: 'El teléfono/contraseña no corresponden a los datos almacenados.',
            });
        const placePass = await modelGetPasswordByID(data.rows[0].place_id);

        const passwordOk = bcrypt.compareSync(body.password || '', placePass[0].password);

        if (!passwordOk)
            return res.status(401).json({
                ok: false,
                msg: 'El teléfono/contraseña no corresponden a los datos almacenados.',
            });


        const place = {
            id: data.rows[0].place_id,
            phone: data.rows[0].phone
        }
        const token = await generateJwt(place);

        return res.status(200).json({
            ok: true,
            msg: 'Login correcto.',
            data: data.rows,
            token
        });


    } catch (e) {
        console.log('catchError en loginPlace:', e);

        return res.status(500).json({
            ok: false,
            msg: 'Error en loginPlace.',
            error: e.stack
        });

    };
};


/**DOCS
 * Se verifica que el token sea válido, si lo es, continúa al siguiente
 * paso y crea una cookie con los datos del usuario obtenidos del token.
 * Si el token no es válido, se redirige a 'login'.
 * @memberof validatePlaceJWT
 * @method validatePlaceJWT
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas
 * @param {Object} res Es la respuesta que proviene de las rutas  
 * @param {Function} next Continúa al siguiente middleware
 * @throws Redirige a la página de login
 */
//Validate Place Token +++++++++
const validatePlaceJWT = async ({ body }, res) => {

    const token = body.token;

    if (token) {

        try {

            const payload = jwt.verify(token, process.env.SECRET_KEY);

            const placeToken = {
                place_id: payload.place_id,
                phone: payload.phone
            };

            const newToken = await renewToken(placeToken);

            const place = await getPlaceByPhone(payload.phone);
            if (!place)
                return res.status(500).json({
                    ok: false,
                    msg: 'Verificación del token incorrecta.'
                });

            return res.status(200).json({
                ok: true,
                msg: 'Verificación del token correcta.',
                user: place.rows,
                token: newToken.token
            });

        } catch (e) {
            console.log('catchError en validatePlaceJWT: ', e)

            return res.status(500).json({
                ok: false,
                msg: 'Verificación del token incorrecta.'
            });

        };

    } else
        return res.status(500).json({
            ok: false,
            msg: 'Verificación del token incorrecta.'
        });

};


module.exports = {
    validatePlaceJWT,
    getAllRestaurantsControl,
    getAllPlacesControl,
    getPlaceByPhoneControl,
    createPlaceControl,
    updatePlaceControl,
    deletePlaceControl,
    loginPlace
}