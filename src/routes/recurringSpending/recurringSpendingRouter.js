/** Contains the spending related routes of the api */
const express = require('express');

const recurringSpendingRouter = express.Router();
const verifyAuthToken = require('../../middleware/verifyAuthToken');

// Link Routes
recurringSpendingRouter.post('/new', verifyAuthToken, require('./implementations/newRecurringSpending'));
recurringSpendingRouter.post('/update', verifyAuthToken, require('./implementations/updateRecurringSpending'));
recurringSpendingRouter.get('/all_transactions', verifyAuthToken, require('./implementations/allRecurringTransactions'));
recurringSpendingRouter.post('/delete', verifyAuthToken, require('./implementations/deleteRecurringSpending'));
recurringSpendingRouter.post('/edit', verifyAuthToken, require('./implementations/editRecurringSpending'));
recurringSpendingRouter.get('/transaction_history', verifyAuthToken, require('./implementations/recurringTransactionHistory'));

module.exports = recurringSpendingRouter;
