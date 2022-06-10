const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const {getCurrentMonthTransactions, getTotalSpent} = require('./spendingFormatter');

function getUserTransactions(username) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        const upperBound = currentDate.toISOString();
        currentDate.setDate(0); // last day of previous month
        currentDate.setDate(1); // Set to first date
        const lowerBound = currentDate.toISOString();

        // Query to get all transactions for given user between the current date and the first of the previous month
        const STATEMENT = `SELECT * FROM spend_transactions WHERE username=${db.escape(username)} AND date between "${lowerBound}" AND "${upperBound}";`;

        // query the database
        db.query(STATEMENT, function(error, results) {
            if(error) {
                return reject(400);
            }

            let transactionList = results.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            const currentMonth = getCurrentMonthTransactions(transactionList);
            const currentMonthTotal = getTotalSpent(currentMonth);

            const payload = {
                currentMonthTotal,
                currentMonthTransactions: currentMonth,
                recentTransactions: transactionList.slice(0, 5)
            }

            resolve(payload);
        });
    });
}


module.exports = function(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    getUserTransactions(username)
        .then(allTransactions => {
            response.status(200).json({
                spending: allTransactions
            });
        })
        .catch(errorCode => {
            response.status(errorCode).send();
        });
}