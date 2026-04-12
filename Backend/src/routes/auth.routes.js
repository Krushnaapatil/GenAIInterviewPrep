const {Router} = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register', authController.registerUserController);


/**
 * @route POST /api/auth/login
 * @desc Login a user with email and password
 * @access Public
 */
authRouter.post('/login', authController.loginUserController);

/**
 * @route POST /api/auth/logout
 * @description clear the token from user cookies and add the token to blacklist so that it cannot be used again
 * @access Public
 */
authRouter.get('/logout', authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description get the details of currently logged in user, expects token in the cookies
 * @access Private
 */
authRouter.get('/get-me', authMiddleware.authUser, authController.getMeController);


module.exports = authRouter;