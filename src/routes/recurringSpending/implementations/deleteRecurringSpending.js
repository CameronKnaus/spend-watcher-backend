const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function deleteRecurringSpending(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const { recurringSpendId } = request.body;

    if (!recurringSpendId) {
        return response.status(400).send({ error: 'Missing transaction ID' });
    }

    const STATEMENT = `DELETE FROM recurring_spending WHERE username=${db.escape(username)} AND recurring_spend_id=${db.escape(recurringSpendId)}`;

    // query the database
    db.query(STATEMENT, (error) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send();
    });
};
