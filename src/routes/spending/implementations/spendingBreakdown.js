const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const db = require('../../../lib/db');
const newArrayOrPush = require('../../../utils/ObjectManipulation/newArrayOrPush');
const increaseTotalByCategory = require('../../../utils/ObjectManipulation/increaseTotalByKey');
const toFixedNumber = require('../../../utils/CalculationHelpers/toFixedNumber');
const fetchAllRecurringTransactions = require('../../recurringSpending/helpers/fetchAllRecurringTransactions');

function groupTransactionByDate(objectUnderConstruction, transaction) {
    const dateISO = transaction.date;
    const date = new Date(transaction.date).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });

    // transaction by date grouping
    newArrayOrPush(objectUnderConstruction, date, {
        transactionId: transaction.transaction_id,
        category: transaction.category,
        amount: transaction.amount,
        isUncommon: !!transaction.uncommon,
        isCustomCategory: !!transaction.is_custom_category,
        date,
        dateISO,
        note: transaction.note,
        linkedTripId: transaction.linked_trip_id
    });
}

module.exports = function spendingBreakdown(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);
    const { startDate } = request.body;
    const { endDate } = request.body;

    const STATEMENT = `SELECT * FROM spend_transactions WHERE username=${db.escape(username)} AND date between ${db.escape(startDate)} AND ${db.escape(endDate)} ORDER BY date DESC;`;

    db.query(STATEMENT, async (error, results) => {
        if (error) {
            return response.status(400).send(error);
        }

        if (!results || !results.length) {
            return response.status(200).json({ noTransactions: true });
        }

        fetchAllRecurringTransactions(username, startDate, endDate).then((recurringTransactionData) => {
            // Do an initial pass through all transactions, making a group by date object and spending totals
            let discretionaryTotal = 0;
            let finalTotalTransactions = 0;
            const transactionsGroupedByDate = {};
            const totalSpentPerCategory = {};
            const totalTransactionsPerCategory = {};

            // const transactionsList = [...results, ...(recurringTransactionData.recurringTransactions || [])];
            results.forEach((transaction) => {
                // Update final total with current transaction
                discretionaryTotal += transaction.amount;
                finalTotalTransactions++;

                // transaction by date grouping
                groupTransactionByDate(transactionsGroupedByDate, transaction);

                // Increase total spent per category
                increaseTotalByCategory(totalSpentPerCategory, transaction.category, transaction.amount);
                // Ensure all totals are rounded properly to 2 decimals
                Object.keys(totalSpentPerCategory).forEach((key) => {
                    totalSpentPerCategory[key] = toFixedNumber(totalSpentPerCategory[key]);
                });

                // Increase the amount transactions made for the given category
                increaseTotalByCategory(totalTransactionsPerCategory, transaction.category, 1);
            });

            const recurringSpendTotal = recurringTransactionData.actualMonthTotal || 0;

            response.status(200).json({
                finalTotalSpent: discretionaryTotal + recurringSpendTotal,
                recurringSpendTotal,
                discretionaryTotal,
                finalTotalTransactions,
                transactionsGroupedByDate,
                totalSpentPerCategory,
                totalTransactionsPerCategory,
                recurringTransactionData
            });
        }).catch((recurringTransactionError) => {
            console.log(recurringTransactionError);
            response.status(400).send();
        });
    });
};
