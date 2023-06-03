const db = require('../../../lib/db');

// This util pulls all transaction data from recurring expenses. All transactions related to a recurring expense will be pulled
// into a single list for a given time period.  Each object in the list will contain the recurring expense's name, id, and other meta data.
module.exports = function fetchRecurringTransactionHistory(username, startDate, endDate) {
    return new Promise((resolve, reject) => {
        let dateClause = '';

        if (startDate && endDate) {
            dateClause = `WHERE date BETWEEN ${db.escape(startDate)} AND ${db.escape(endDate)} `;
        }

        // Gather params
        const QUERY = `SELECT RecurringExpenses.recurring_spend_id, username, category, spend_name, amount, is_variable_recurring, is_active, transaction_amount, date, transaction_id
                    FROM ( SELECT * FROM user_information.recurring_spending WHERE username="${username}") AS RecurringExpenses
                    JOIN ( 
                        SELECT * FROM user_information.recurring_transactions AS A
                        INNER JOIN (
                            SELECT recurring_spend_id AS recurringSpendMaxId${dateClause ? '' : ', MAX(date) AS maxDate'}
                            FROM user_information.recurring_transactions
                            GROUP BY recurring_spend_id
                        ) AS B
                        ON A.recurring_spend_id = B.recurringSpendMaxId ${dateClause ? '' : ' AND A.date = B.maxDate'}
                    ) AS RecentTransactions
                    ON RecurringExpenses.recurring_spend_id = RecentTransactions.recurring_spend_id ${dateClause}ORDER BY amount DESC`;

        db.query(QUERY, (error, results) => {
            if (error) {
                return reject(error);
            }

            const recurringTransactionList = results.map((transactionData) => ({
                transactionId: transactionData.transaction_id,
                date: transactionData.date,
                transactionAmount: transactionData.transaction_amount,
                isActive: Boolean(transactionData.is_active),
                isVariableRecurring: transactionData.is_variable_recurring,
                estimatedAmount: transactionData.amount,
                expenseName: transactionData.spend_name,
                category: transactionData.category,
                recurringSpendId: transactionData.recurring_spend_id
            }));

            return resolve(recurringTransactionList);
        });
    });
};
