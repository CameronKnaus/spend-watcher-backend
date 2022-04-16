/** Contains the authentication routes of the api */
const express = require('express');
const authRouter = express.Router();
const validateRegistration = require('../../middleware/validateRegistration');
const verifyAuthToken = require('../../middleware/verifyAuthToken');

// Link Routes
authRouter.post('/processRegistration', validateRegistration, require('./implementations/processRegistration'));
authRouter.get('/verifyLogin', verifyAuthToken, require('./implementations/verifyLogin'));
authRouter.post('/processLogin', require('./implementations/processLogin'));

module.exports = authRouter;