const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function editSpending(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const {
        transactionId, category, amount, isUncommon, selectedDate, note
    } = request.body;
    if (typeof amount !== 'number' || typeof category !== 'string' || typeof isUncommon !== 'boolean' || (typeof note !== 'string')) {
        return response.status(400).send({ message: 'Invalid types given as arguments' });
    }
    const STATEMENT = `UPDATE spend_transactions SET category=${db.escape(category)}, amount=${db.escape(amount)},`
        + `uncommon=${db.escape(isUncommon)}, date=${db.escape(selectedDate)}, note=${note ? db.escape(note) : 'NULL'} `
        + `WHERE username="${username}" AND transaction_id=${transactionId}`;

    // query the database
    db.query(STATEMENT, (error) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send();
    });
};
