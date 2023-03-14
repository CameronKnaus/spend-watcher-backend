const db = require('../../../lib/db');

module.exports = function updateAccountBalance(request, response) {
    // Gather params
    const { accountId, accountValue, isRevision } = request.body;

    if (!accountId) {
        return response.status(400).send({ error: 'Account requires target accountId' });
    }

    if (Number.isNaN(accountValue)) {
        return response.status(400).send(({ error: 'accountValue must be a number' }));
    }

    const firstDayOfMonth = 'DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW())-1 DAY)';
    const INSERT_QUERY = `INSERT INTO money_account_updates (account_id, date, amount) VALUES (${db.escape(accountId)}, ${firstDayOfMonth}, ${accountValue});`;
    const DELETE_QUERY = `DELETE FROM money_account_updates WHERE account_id=${db.escape(accountId)} AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE());`;

    const QUERY_LIST = ['START TRANSACTION;'];
    if (isRevision) {
        QUERY_LIST.push(DELETE_QUERY);
    }
    QUERY_LIST.push(INSERT_QUERY);

    // query the database
    db.query(QUERY_LIST.join(' '), (error) => {
        if (error) {
            console.log(error);
            db.query('ROLLBACK;');
            return response.status(400).send();
        }

        db.query('COMMIT;');
        response.status(200).send();
    });
};
