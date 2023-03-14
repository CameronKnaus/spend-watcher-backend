const db = require('../../../lib/db');

// Accepts dates in the YYYY-MM format
module.exports = function updateRecurringSpending(request, response) {
    // Gather params
    const {
        recurringSpendId, amountSpent, isRevision, date, transactionId
    } = request.body;

    if (!recurringSpendId) {
        return response.status(400).send({ error: 'transaction requires target recurringSpendId' });
    }

    if (Number.isNaN(amountSpent)) {
        return response.status(400).send(({ error: 'amountSpent must be a number' }));
    }

    const targetDate = `${date}-01`;
    const INSERT_QUERY = `INSERT INTO recurring_transactions (recurring_spend_id, transaction_amount, date, transaction_id) VALUES (${db.escape(recurringSpendId)}, ${amountSpent}, ${db.escape(targetDate)}, ${db.escape(transactionId)});`;
    const UPDATE_QUERY = `UPDATE recurring_transactions SET transaction_amount=${db.escape(amountSpent)} WHERE transaction_id=${db.escape(transactionId)};`;
    const QUERY_LIST = ['START TRANSACTION;'];
    QUERY_LIST.push(isRevision ? UPDATE_QUERY : INSERT_QUERY);

    // query the database
    db.query(QUERY_LIST.join(' '), (error) => {
        if (error) {
            console.log(error);
            db.query('ROLLBACK;');
            response.status(400).send();
            return;
        }

        db.query('COMMIT;');
        response.status(200).send();
    });
};
