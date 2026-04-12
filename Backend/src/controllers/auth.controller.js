const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
};


/**
 * @name registerUserController
 * @description register a new user in the system, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        const isUserAlreadyExists = await userModel.findOne({ $or: [{ username }, { email }] });

        if (isUserAlreadyExists) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hash = await bcrypt.hash(password, 10);
        
        const user = await userModel.create({
            username,
            email,
            password: hash,
        }); 

        const token = jwt.sign({ id: user.id , username: user.username}, process.env.JWT_SECRET, { expiresIn: '1d' }); 

        res.cookie('token', token, cookieOptions)

        res.status(201).json({ message: 'User registered successfully',user: { id: user.id, username: user.username, email: user.email } });
}

/**
 * @name loginUserController
 * @description login a user in the system, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id , username: user.username}, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, cookieOptions)
    res.status(200).json({ message: 'User logged in successfully', user: { id: user.id, username: user.username, email: user.email } });
}


/**
 * @name logoutUserController
 * @description clear the token from user cookies and add the token to blacklist so that it cannot be used again
 * @access Public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token;
    
    if (token) {
        await tokenBlacklistModel.create({ token });

    }

    res.clearCookie('token', cookieOptions);
    res.status(200).json({ message: 'User logged out successfully' });
}

/**
 * @name getMeController
 * @description get the details of currently logged in user, expects token in the cookies
 * @access Private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id).select(req.user.id);

    res.status(200).json({message: 'User details retrieved successfully', user: { id: user.id, username: user.username, email: user.email } });
}


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};  
