/** Contains the spending related routes of the api */
const express = require('express');

const tripsRouter = express.Router();
const verifyAuthToken = require('../../middleware/verifyAuthToken');

// Link Routes
tripsRouter.get('/all', verifyAuthToken, require('./implementations/fetchAllTrips'));
tripsRouter.post('/edit', verifyAuthToken, require('./implementations/editTrip'));
tripsRouter.post('/new', verifyAuthToken, require('./implementations/newTrip'));
tripsRouter.get('/linked_expenses', verifyAuthToken, require('./implementations/getExpensesLinkedToTrip'));
tripsRouter.post('/delete', verifyAuthToken, require('./implementations/deleteTrip'));

module.exports = tripsRouter;
