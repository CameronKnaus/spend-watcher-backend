const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function deleteSpending(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const { transactionId } = request.body;

    if (!transactionId) {
        return response.status(400).send({ error: 'Missing transaction ID' });
    }

    const STATEMENT = `DELETE FROM spend_transactions WHERE username=${db.escape(username)} AND transaction_id=${db.escape(transactionId)}`;

    // query the database
    db.query(STATEMENT, (error) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send();
    });
};
