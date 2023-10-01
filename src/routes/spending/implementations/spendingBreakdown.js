const dayjs = require('dayjs');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const db = require('../../../lib/db');
const increaseTotalByCategory = require('../../../utils/ObjectManipulation/increaseTotalByKey');
const toFixedNumber = require('../../../utils/CalculationHelpers/toFixedNumber');
const fetchRecurringTransactionHistory = require('../../recurringSpending/helpers/fetchRecurringTransactionHistory');
const formatTransaction = require('./helpers/formatTransaction');
const newArrayOrPush = require('../../../utils/ObjectManipulation/newArrayOrPush');
const generateCategoryTotalDataPoints = require('./helpers/generateCategoryTotalDataPoints');

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

            if (noDiscretionaryData && (!includeRecurringTransactions && noRecurringData)) {
                return response.status(200).json({ noTransactions: true });
            }

            // Do an initial pass through all transactions, making a group by date object and spending totals
            let discretionaryTotal = 0;
            let recurringSpendTotal = 0;
            let finalTotalTransactions = 0;
            const transactionsGroupedByDate = {};
            const totalSpentPerCategory = {};
            const totalTransactionsPerCategory = {};
            const transactionsMappedById = {};
            const includedCategoriesSet = new Set();

            [...discretionaryTransactionData, ...recurringTransactionData].forEach((transaction) => {
                const isRecurringTransaction = Boolean(transaction.recurringSpendId);
                const transactionAmount = transaction.amount;

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

                // Add category to included categories list
                includedCategoriesSet.add(transaction.category);

                // Add transaction to id-based look up table
                const { transactionId, formattedTransaction } = formatTransaction(transaction, isRecurringTransaction);
                transactionsMappedById[transactionId] = formattedTransaction;

                // group transactions by date
                newArrayOrPush(transactionsGroupedByDate, formattedTransaction.date, formattedTransaction);

                // Increase total spent per category
                increaseTotalByCategory(totalSpentPerCategory, transaction.category, transactionAmount);

                // Increase the amount transactions made for the given category
                increaseTotalByCategory(totalTransactionsPerCategory, transaction.category, 1);
            });

            // Ensure all totals are rounded properly to 2 decimals
            Object.keys(totalSpentPerCategory).forEach((key) => {
                totalSpentPerCategory[key] = toFixedNumber(totalSpentPerCategory[key]);
            });

            // Get the date range
            const targetDataSet = noDiscretionaryData ? recurringTransactionData : discretionaryTransactionData;
            const startDateDayJS = dayjs(targetDataSet.at(-1).date);
            const endDateDayJS = dayjs(targetDataSet.at(0).date);

            const categoryTotalDataPoints = generateCategoryTotalDataPoints([...includedCategoriesSet], transactionsGroupedByDate, transactionsMappedById, startDateDayJS, endDateDayJS);

            response.status(200).json({
                startDate: startDateDayJS?.format('MM/DD/YYYY'),
                endDate: endDateDayJS?.format('MM/DD/YYYY'),
                finalTotalSpent: toFixedNumber(discretionaryTotal + recurringSpendTotal),
                recurringSpendTotal: toFixedNumber(recurringSpendTotal),
                discretionaryTotal: toFixedNumber(discretionaryTotal),
                transactionsMappedById,
                finalTotalTransactions,
                transactionsGroupedByDate,
                categoryTotals: totalSpentPerCategory,
                totalTransactionsPerCategory,
                categoryTotalDataPoints
            });
        }).catch((recurringTransactionError) => {
            console.log(recurringTransactionError);
            response.status(400).send();
        });
    });
};
