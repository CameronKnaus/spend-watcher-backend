const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const dayjs = require('dayjs');

module.exports = function (request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Gather params

    const QUERY = `SELECT AccountsTable.account_id, username, account_name, is_fixed, type, growth_rate, date, amount
                    FROM ( SELECT * FROM user_information.money_accounts WHERE username="${username}") AS AccountsTable
                    JOIN ( 
                        SELECT * FROM user_information.money_account_updates AS A
                        INNER JOIN (
                            SELECT account_id AS maxAccountId, MAX(date) AS maxDate
                            FROM user_information.money_account_updates
                            GROUP BY account_id
                        ) AS B
                        ON A.account_id = B.maxAccountId AND A.date = B.maxDate
                    ) AS RecentAccountValues
                    ON AccountsTable.account_id = RecentAccountValues.account_id;`;


    // query the database
    db.query(QUERY, function (error, results) {
        if (error) {
            console.log(error);
            return results.status(400).send(error);
        }

        let totalEquity = 0;

        const accountsList = results.map(accountInfo => {
            const lastUpdated = dayjs(accountInfo.date).format('MM/YYYY');

            // Needs new update if no update for the current month
            const requiresNewUpdate = dayjs().format('MM/YYYY') !== lastUpdated;

            totalEquity += accountInfo.amount;

            return {
                accountId: accountInfo.account_id,
                accountName: accountInfo.account_name,
                hasVariableGrowthRate: !accountInfo.is_fixed,
                accountType: accountInfo.type,
                growthRate: accountInfo.growth_rate,
                lastUpdated,
                requiresNewUpdate,
                currentAccountValue: accountInfo.amount
            }
        });

        response.status(200).send({
            totalEquity,
            // Sort by account value, highest to lowest
            accountsList: accountsList.sort((a, b) => a.currentAccountValue < b.currentAccountValue ? 1 : -1)
        });
    });
}