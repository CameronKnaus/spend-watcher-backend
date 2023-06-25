const dayjs = require('dayjs');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const db = require('../../../lib/db');
const newArrayOrPush = require('../../../utils/ObjectManipulation/newArrayOrPush');
const increaseTotalByCategory = require('../../../utils/ObjectManipulation/increaseTotalByKey');
const toFixedNumber = require('../../../utils/CalculationHelpers/toFixedNumber');
const fetchRecurringTransactionHistory = require('../../recurringSpending/helpers/fetchRecurringTransactionHistory');

function groupTransactionByDate(objectUnderConstruction, transaction, isRecurringTransaction) {
    const dateISO = transaction.date;
    const date = dayjs(transaction.date).format('MM/DD/YY');

    const dataToPush = isRecurringTransaction ? {
        ...transaction,
        date
    } : {
        transactionId: transaction.transaction_id,
        category: transaction.category,
        amount: transaction.amount,
        isUncommon: !!transaction.uncommon,
        isCustomCategory: !!transaction.is_custom_category,
        date,
        dateISO,
        note: transaction.note,
        linkedTripId: transaction.linked_trip_id,
        isRecurringTransaction
    };

    // transaction by date grouping
    newArrayOrPush(objectUnderConstruction, date, dataToPush);
}

module.exports = async function spendingBreakdown(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);
    const {
        startDate, endDate, includeRecurringTransactions, showAllData
    } = request.body;

    const dateClause = ` AND date between ${db.escape(startDate)} AND ${db.escape(endDate)}`;
    const STATEMENT = `SELECT * FROM spend_transactions WHERE username=${db.escape(username)}${showAllData ? '' : dateClause} ORDER BY date DESC;`;

    db.query(STATEMENT, (error, discretionaryTransactionData) => {
        if (error) {
            return response.status(400).send(error);
        }

        fetchRecurringTransactionHistory(username, startDate, endDate).then((recurringTransactionData) => {
            const noDiscretionaryData = !discretionaryTransactionData || !discretionaryTransactionData.length;
            const noRecurringData = !recurringTransactionData || !recurringTransactionData.length;
            if (noDiscretionaryData && noRecurringData) {
                return response.status(200).json({ noTransactions: true });
            }

            // Do an initial pass through all transactions, making a group by date object and spending totals
            let discretionaryTotal = 0;
            let recurringSpendTotal = 0;
            let finalTotalTransactions = 0;
            const transactionsGroupedByDate = {};
            const totalSpentPerCategory = {};
            const totalTransactionsPerCategory = {};

            [...discretionaryTransactionData, ...recurringTransactionData].forEach((transaction) => {
                const isRecurringTransaction = Boolean(transaction.recurringSpendId);
                const transactionAmount = isRecurringTransaction ? transaction.transactionAmount : transaction.amount;

                // Update final total with current transaction
                if (isRecurringTransaction) {
                    recurringSpendTotal += transactionAmount;
                } else {
                    discretionaryTotal += transactionAmount;
                }

                if (isRecurringTransaction && !includeRecurringTransactions) {
                    return;
                }

                finalTotalTransactions++;

                // transaction by date grouping
                groupTransactionByDate(transactionsGroupedByDate, transaction, isRecurringTransaction);

                // Increase total spent per category
                increaseTotalByCategory(totalSpentPerCategory, transaction.category, transactionAmount);

                // Increase the amount transactions made for the given category
                increaseTotalByCategory(totalTransactionsPerCategory, transaction.category, 1);
            });

            // Ensure all totals are rounded properly to 2 decimals
            Object.keys(totalSpentPerCategory).forEach((key) => {
                totalSpentPerCategory[key] = toFixedNumber(totalSpentPerCategory[key]);
            });

            response.status(200).json({
                dateRange: {
                    start: dayjs(discretionaryTransactionData.at(-1).date).format('MM/DD/YYYY'),
                    end: dayjs(discretionaryTransactionData.at(0).date).format('MM/DD/YYYY')
                },
                finalTotalSpent: toFixedNumber(discretionaryTotal + recurringSpendTotal),
                recurringSpendTotal: toFixedNumber(recurringSpendTotal),
                discretionaryTotal: toFixedNumber(discretionaryTotal),
                finalTotalTransactions,
                transactionsGroupedByDate,
                totalSpentPerCategory,
                totalTransactionsPerCategory
            });
        }).catch((recurringTransactionError) => {
            console.log(recurringTransactionError);
            response.status(400).send();
        });
    });
};
