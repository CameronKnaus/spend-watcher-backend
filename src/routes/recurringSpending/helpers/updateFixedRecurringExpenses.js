const dayjs = require('dayjs');
const db = require('../../../lib/db');

function createUpdateQueryString(transactionId, transactionAmount) {
    return `INSERT INTO recurring_transactions (recurring_spend_id, transaction_amount, date) VALUES (${db.escape(transactionId)}, ${db.escape(transactionAmount)}, DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW())-1 DAY));`;
}

// This helper is used to first update recurring fixed transactions
// to ensure they are created for the current month.
module.exports = function updateFixedRecurringExpenses(username) {
    return new Promise((resolve) => {
        // Gather params
        const QUERY = `SELECT RecurringExpenses.recurring_spend_id, username, is_variable_recurring, is_active, date, amount
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
                        ON RecurringExpenses.recurring_spend_id = RecentTransactions.recurring_spend_id WHERE is_variable_recurring=0 AND is_active=1`;

        db.query(QUERY, (error, results) => {
            if (error) {
                console.log(error);
            }

            const currentMonth = dayjs(new Date()).format('MM/YYYY');
            const updateQueryList = results.map((transaction) => {
                if (dayjs(transaction.date).format('MM/YYYY') === currentMonth) {
                    return '';
                }

                return createUpdateQueryString(transaction.recurring_spend_id, transaction.amount);
            }).join('');

            if (!updateQueryList) {
                return resolve();
            }

            db.query(updateQueryList, (updateError) => {
                if (updateError) {
                    console.log(updateError);
                }

                return resolve();
            });
        });
    });
};
