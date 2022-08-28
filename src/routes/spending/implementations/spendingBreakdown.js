const getUsernameFromToken = require("../../../utils/TokenUtils/getUsernameFromToken");
const db = require("../../../lib/db");
const newArrayOrPush = require("../../../utils/newArrayOrPush");

module.exports = function(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);
    const startDate = request.body.startDate;
    const endDate = request.body.endDate;


    // TODO: Sanitize
    const STATEMENT = `SELECT * FROM spend_transactions WHERE username=${db.escape(username)} AND date between ${db.escape(startDate)} AND ${db.escape(endDate)} ORDER BY date DESC;`;

    db.query(STATEMENT, function(error, results) {
        if (error) {
            return response.status(400).send(error);
        }

        if(!results || !results.length) {
            return response.status(200).json({ noTransactions: true });
        }

        const transactionsGroupedByDate = {}
        results.forEach(transaction => {
            const dateISO = transaction.date;
            const date = new Date(transaction.date).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });

            // transaction by date grouping
            newArrayOrPush(transactionsGroupedByDate, date, {
                transactionId: transaction.transaction_id,
                category: transaction.category,
                amount: transaction.amount,
                isUncommon: !!transaction.uncommon,
                isCustomCategory: !!transaction.is_custom_category,
                date,
                dateISO,
                note: transaction.note
            });
        })

        response.status(200).json({
            transactionsGroupedByDate
        });
    });
}