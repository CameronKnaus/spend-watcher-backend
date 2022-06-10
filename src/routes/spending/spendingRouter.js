/** Contains the spending related routes of the api */
const express = require('express');
const spendingRouter = express.Router();
const verifyAuthToken = require('../../middleware/verifyAuthToken');

// Link Routes
spendingRouter.get('/summary', verifyAuthToken, require('./implementations/spendingSummary'));
spendingRouter.get('/recent', verifyAuthToken, require('./implementations/recentSpending'));
spendingRouter.post('/new', verifyAuthToken, require('./implementations/newSpending'));
spendingRouter.post('/edit', verifyAuthToken, require('./implementations/editSpending'));

module.exports = spendingRouter;