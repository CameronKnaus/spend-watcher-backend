const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function (request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const { accountId, accountCategory, accountName, hasVariableGrowthRate, growthRate } = request.body;
    if (typeof accountCategory !== 'string' || typeof accountName !== 'string' || typeof hasVariableGrowthRate !== 'boolean' || typeof growthRate !== 'number') {
        return response.status(400).send({ message: 'Invalid types given as arguments' });
    }

    const STATEMENT = `UPDATE money_accounts SET type=${db.escape(accountCategory)}, is_fixed=${!hasVariableGrowthRate},`
        + `account_name=${db.escape(accountName)}, growth_rate=${growthRate ?? 0} `
        + `WHERE username="${username}" AND account_id=${db.escape(accountId)}`;

    // query the database
    db.query(STATEMENT, function (error) {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send();
    });
}