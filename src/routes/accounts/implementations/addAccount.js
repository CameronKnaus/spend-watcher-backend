const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const { v4: uuidv4 } = require('uuid');

const SUPPORTED_ACCOUNTS = {
    CHECKING: true,
    SAVINGS: true,
    INVESTING: true,
    BONDS: true
}

module.exports = function (request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Gather params
    const { accountCategory, growthRate = 0, hasVariableGrowthRate = false, startingAccountValue, accountName } = request.body;
    const startingAmount = startingAccountValue < 0 ? 0 : startingAccountValue;

    if (!accountName) {
        return response.status(400).send({ error: 'Account requires a name' });
    }

    if (!SUPPORTED_ACCOUNTS[accountCategory]) {
        return response.status(400).send({ error: 'Unknown Account Type provided' });
    }

    const newAccountId = uuidv4();

    const QUERY_LIST = [
        'START TRANSACTION;',
        `INSERT INTO money_accounts (account_id, username, account_name, is_fixed, type, growth_rate) VALUES (${db.escape(newAccountId)}, ${db.escape(username)}, ${db.escape(accountName)}, ${!hasVariableGrowthRate}, ${db.escape(accountCategory)}, ${growthRate});`,
        `INSERT INTO money_account_updates VALUES (${db.escape(newAccountId)}, DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW())-1 DAY), ${startingAmount});`
    ].join(' ');


    // query the database
    db.query(QUERY_LIST, function (error) {
        if (error) {
            console.log(error);
            db.query('ROLLBACK;');
            return response.status(400).send();
        }

        db.query('COMMIT;');
        response.status(200).send();
    });
}