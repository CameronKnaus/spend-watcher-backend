const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function newSpending(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const {
        category, amount, isUncommon, selectedDate, note
    } = request.body;
    if (typeof amount !== 'number' || typeof category !== 'string' || typeof isUncommon !== 'boolean' || (typeof note !== 'string')) {
        return response.status(400).send({ message: 'Invalid types given as arguments' });
    }
    const STATEMENT = `INSERT INTO spend_transactions (username, category, amount, uncommon, date, note) VALUES (${db.escape(username)}, ${db.escape(category)}, ${db.escape(amount)}, ${db.escape(isUncommon)}, ${db.escape(selectedDate)}, ${note ? db.escape(note) : 'NULL'});`;

    // query the database
    db.query(STATEMENT, (error) => {
        if (error) {
            return response.status(400).send();
        }

        response.status(200).send();
    });
};
