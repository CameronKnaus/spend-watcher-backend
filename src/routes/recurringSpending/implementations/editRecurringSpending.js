const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function editRecurringSpending(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    const {
        recurringSpendId, spendCategory, amount, isVariable, spendName
    } = request.body;
    if (typeof amount !== 'number' || typeof spendCategory !== 'string' || typeof isVariable !== 'boolean' || (typeof spendName !== 'string')) {
        return response.status(400).send({ message: 'Invalid types given as arguments' });
    }
    const STATEMENT = `UPDATE recurring_spending SET category=${db.escape(spendCategory)}, amount=${db.escape(amount)},`
        + `spend_name=${db.escape(spendName)}, is_variable_recurring=${isVariable} `
        + `WHERE username=${db.escape(username)} AND recurring_spend_id=${db.escape(recurringSpendId)}`;

    // query the database
    db.query(STATEMENT, (error) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send();
    });
};
