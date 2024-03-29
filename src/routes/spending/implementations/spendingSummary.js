const dayjs = require('dayjs');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const { getCurrentMonthTransactions, getTotalSpent } = require('./spendingFormatter');
const fetchAllRecurringTransactions = require('../../recurringSpending/helpers/fetchAllRecurringTransactions');

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
        db.query(STATEMENT, (error, results) => {
            if (error) {
                return reject(400);
            }

            const transactionList = results.sort((a, b) => new Date(b.date) - new Date(a.date));

            transactionList.forEach((transaction) => {
                transaction.date = dayjs(transaction.date).format('MM/DD/YY');
            });

            const currentMonth = getCurrentMonthTransactions(transactionList);
            const currentMonthTotal = getTotalSpent(currentMonth);

            const payload = {
                currentMonthTotal,
                currentMonthTransactions: currentMonth
            };

            resolve(payload);
        });
    });
}

module.exports = function spendingSummary(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    Promise.all([
        getUserTransactions(username),
        fetchAllRecurringTransactions(username)
    ]).then(([allTransactions, recurringSpending]) => {
        const totalSpentThisMonth = (Number(allTransactions.currentMonthTotal) + (recurringSpending.actualMonthTotal || 0)).toFixed(2);

        response.status(200).json({
            totalSpentThisMonth,
            spending: allTransactions,
            recurringSpending
        });
    }).catch((errorCode) => {
        response.status(errorCode).send();
    });
};
