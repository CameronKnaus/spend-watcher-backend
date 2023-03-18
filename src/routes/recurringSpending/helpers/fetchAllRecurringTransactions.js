const dayjs = require('dayjs');
const db = require('../../../lib/db');
const updateFixedRecurringExpenses = require('./updateFixedRecurringExpenses');

module.exports = function fetchAllRecurringTransactions(username) {
    return new Promise((resolve, reject) => {
        updateFixedRecurringExpenses(username);

        const QUERY = `SELECT RecurringExpenses.recurring_spend_id, username, category, spend_name, amount, is_variable_recurring, is_active, transaction_amount, date, transaction_id
                    FROM ( SELECT * FROM user_information.recurring_spending WHERE username="${username}") AS RecurringExpenses
                    JOIN ( 
                        SELECT * FROM user_information.recurring_transactions AS A
                        INNER JOIN (
                            SELECT recurring_spend_id AS recurringSpendMaxId, MAX(date) AS maxDate
                            FROM user_information.recurring_transactions
                            GROUP BY recurring_spend_id
                        ) AS B
                        ON A.recurring_spend_id = B.recurringSpendMaxId AND A.date = B.maxDate
                    ) AS RecentTransactions
                    ON RecurringExpenses.recurring_spend_id = RecentTransactions.recurring_spend_id ORDER BY amount DESC`;

        // query the database
        db.query(QUERY, (error, results) => {
            if (error) {
                return reject();
            }

            if (results.length === 0) {
                return resolve({ noTransactions: true });
            }

            let actualMonthTotal = 0;
            let estimatedMonthTotal = 0;
            let hasVariableRecurring = false;
            let monthlyExpenseRequiresUpdate = false;

            const recurringTransactions = results.map((transaction) => {
                const isVariableRecurring = Boolean(transaction.is_variable_recurring);
                const estimatedAmount = Number(transaction.amount.toFixed(2));

                // Add amount to total
                estimatedMonthTotal += estimatedAmount;

                // Set flag to indicate a transaction that varies month to month
                if (!hasVariableRecurring) {
                    hasVariableRecurring = Boolean(isVariableRecurring);
                }

                const transactionDetails = {
                    recurringSpendId: transaction.recurring_spend_id,
                    category: transaction.category,
                    expenseName: transaction.spend_name,
                    estimatedAmount,
                    isVariableRecurring,
                    isActive: Boolean(transaction.is_active)
                };

                const transactionAmount = Number(transaction.transaction_amount.toFixed(2));

                if (isVariableRecurring) {
                    const currentMonth = dayjs(new Date()).format('MM/YYYY');
                    const lastLoggedMonth = dayjs(transaction.date).format('MM/YYYY');
                    const requiresUpdate = currentMonth !== lastLoggedMonth;
                    const actualTransactionAmount = requiresUpdate ? estimatedAmount : transactionAmount;

                    transactionDetails.requiresUpdate = requiresUpdate;
                    transactionDetails.actualAmount = actualTransactionAmount;
                    actualMonthTotal += actualTransactionAmount;

                    if (!monthlyExpenseRequiresUpdate) {
                        monthlyExpenseRequiresUpdate = requiresUpdate;
                    }
                } else {
                    // Fixed monthly just needs to use amount
                    transactionDetails.actualAmount = transactionAmount;
                    actualMonthTotal += transactionAmount;
                }

                return transactionDetails;
            });

            return resolve({
                monthlyExpenseRequiresUpdate,
                estimateVariance: actualMonthTotal - estimatedMonthTotal,
                hasVariableRecurring,
                estimatedMonthTotal,
                actualMonthTotal,
                recurringTransactions
            });
        });
    });
};
