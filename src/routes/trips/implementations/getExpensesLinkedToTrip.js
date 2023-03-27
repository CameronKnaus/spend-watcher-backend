const dayjs = require('dayjs');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const newArrayOrPush = require('../../../utils/ObjectManipulation/newArrayOrPush');

module.exports = function getExpensesLinkedToTrip(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    const { tripId } = request.query;

    if (!tripId) {
        return response.status(400).send();
    }

    // Query to get the last 5 transactions
    const STATEMENT = `SELECT * FROM spend_transactions WHERE username=${db.escape(username)} AND linked_trip_id=${db.escape(tripId)} ORDER BY date DESC;`;

    // query the database
    db.query(STATEMENT, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        if (!results) {
            return response.status(200).send({ transactionList: [] });
        }

        const payload = {};
        results.forEach((transaction) => {
            const dateISO = transaction.date;
            const date = dayjs(transaction.date).format('MM/DD/YY');

            newArrayOrPush(payload, date, {
                transactionId: transaction.transaction_id,
                category: transaction.category,
                amount: transaction.amount,
                isUncommon: !!transaction.uncommon,
                isCustomCategory: !!transaction.is_custom_category,
                date,
                dateISO,
                note: transaction.note,
                linkedTripId: transaction.linked_trip_id
            });
        });

        return response.status(200).send({ transactionList: payload });
    });
};
