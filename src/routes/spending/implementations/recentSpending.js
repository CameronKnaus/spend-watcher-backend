const dayjs = require('dayjs');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const newArrayOrPush = require('../../../utils/ObjectManipulation/newArrayOrPush');

module.exports = function recentSpending(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const STATEMENT = `SELECT * FROM spend_transactions WHERE username=${db.escape(username)} ORDER BY date DESC LIMIT 5`;

    // query the database
    db.query(STATEMENT, (error, results) => {
        if (error) {
            return response.status(400).send();
        }

        if (results.length === 0) {
            return response.status(200).send({ noTransactions: true });
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

        response.status(200).send({ transactions: payload });
    });
};
