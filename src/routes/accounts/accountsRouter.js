/** Contains the spending related routes of the api */
const express = require('express');

const accountsRouter = express.Router();
const verifyAuthToken = require('../../middleware/verifyAuthToken');

// Link Routes
accountsRouter.post('/new', verifyAuthToken, require('./implementations/addAccount'));
accountsRouter.get('/summary', verifyAuthToken, require('./implementations/accountSummary'));
accountsRouter.post('/edit', verifyAuthToken, require('./implementations/editAccount'));
accountsRouter.post('/update', verifyAuthToken, require('./implementations/updateAccountBalance'));

module.exports = accountsRouter;
