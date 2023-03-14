const dayjs = require('dayjs');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function recurringTransactionHistory(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    const { recurringSpendId: recurringSpendIdRequestParam, currentDate } = request.query;

    // Gather params
    const QUERY = `SELECT RecurringExpenses.recurring_spend_id, username, date, amount, transaction_amount, is_variable_recurring, transaction_id
                    FROM ( SELECT * FROM user_information.recurring_spending WHERE username="${username}" AND recurring_spend_id=${db.escape(recurringSpendIdRequestParam)}) AS RecurringExpenses
                    JOIN ( 
                        SELECT * FROM user_information.recurring_transactions
                    ) AS TransactionsList
                    ON RecurringExpenses.recurring_spend_id = TransactionsList.recurring_spend_id ORDER BY date DESC;`;

    db.query(QUERY, (error, results) => {
        if (error) {
            console.log(error);
        }

        let hasThisMonthLogged = false;
        let isVariable = false;
        let recurringSpendId;
        let estimatedAmount;

        const transactionList = results.map(({
            recurring_spend_id,
            date,
            transaction_amount,
            amount,
            is_variable_recurring,
            transaction_id
        }) => {
            if (!isVariable) {
                isVariable = Boolean(is_variable_recurring);
            }
            if (!recurringSpendId) {
                recurringSpendId = recurring_spend_id;
            }
            if (!estimatedAmount) {
                estimatedAmount = amount;
            }

            const formattedDate = dayjs(date).format('YYYY-MM');

            if (formattedDate === currentDate) {
                hasThisMonthLogged = true;
            }

            return {
                transactionId: transaction_id,
                date: formattedDate,
                transactionAmount: transaction_amount
            };
        });

        return response.status(200).send({
            estimatedAmount,
            recurringSpendId,
            transactionList,
            isVariable,
            hasThisMonthLogged,
            missingDate: dayjs(transactionList[transactionList.length - 1].date).subtract(1, 'month').format('YYYY-MM')
        });
    });
};
