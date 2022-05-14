const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const newArrayOrPush = require('../../../utils/newArrayOrPush');

module.exports = function(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const STATEMENT = `SELECT * FROM spend_transactions WHERE username=${db.escape(username)} ORDER BY date DESC LIMIT 5`;

    // query the database
    db.query(STATEMENT, function(error, results) {
        if(error) {
            return response.status(400).send();
        }

        if(results.length === 0) {
            return response.status(200).send({noTransactions: true})
        }

        const today = new Date();
        today.setHours(0, 0, 0,0);
        const todayISO = today.toISOString();
        today.setDate(today.getDate() - 1);
        const yesterdayISO = today.toISOString();

        const payload = {};
        results.forEach(transaction => {
            // For today's grouping
            if(transaction.date.toISOString() === todayISO) {
                newArrayOrPush(payload, 'today', transaction);
                return;
            }

            // For yesterday's grouping
            if(transaction.date.toISOString() === yesterdayISO) {
                newArrayOrPush(payload, 'yesterday', transaction);
                return;
            }

            // All other dates will be grouped by the date itself
            newArrayOrPush(payload, transaction.date.toISOString(), transaction);
        });

        response.status(200).send({ transactions: payload });
    });
}