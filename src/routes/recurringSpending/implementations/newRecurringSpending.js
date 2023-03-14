const { v4: uuidv4 } = require('uuid');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function newRecurringSpending(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Gather params
    const {
        spendCategory, spendName, amount, isVariable = false
    } = request.body;

    if (amount === 0 || amount < 0) {
        return response.status(400).send({ error: 'Recurring spending item must be more than $0' });
    }

    if (!spendName) {
        return response.status(400).send({ error: 'Recurring spending item requires a name' });
    }

    const newSpendId = uuidv4();

    const QUERY_LIST = [
        'START TRANSACTION;',
        `INSERT INTO recurring_spending (recurring_spend_id, username, category, spend_name, amount, is_variable_recurring, is_active) VALUES (${db.escape(newSpendId)}, ${db.escape(username)}, ${db.escape(spendCategory)}, ${db.escape(spendName)}, ${db.escape(amount)}, ${db.escape(isVariable)}, TRUE);`,
        `INSERT INTO recurring_transactions (recurring_spend_id, transaction_amount, date) VALUES (${db.escape(newSpendId)}, ${db.escape(amount)}, DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW())-1 DAY));`
    ].join(' ');

    // query the database
    db.query(QUERY_LIST, (error) => {
        if (error) {
            console.log(error);
            db.query('ROLLBACK;');
            return response.status(400).send();
        }

        db.query('COMMIT;');
        response.status(200).send();
    });
};
