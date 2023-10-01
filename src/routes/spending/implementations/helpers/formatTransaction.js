const dayjs = require('dayjs');

module.exports = function formatTransaction(transaction, isRecurringTransaction) {
    const dateISO = transaction.date;
    const date = dayjs(transaction.date).format('MM/DD/YY');
    const transactionId = isRecurringTransaction ? transaction.recurringSpendId : transaction.transaction_id;

    return {
        transactionId,
        formattedTransaction: isRecurringTransaction ? {
            ...transaction,
            date,
            isRecurringTransaction
        } : {
            transactionId,
            category: transaction.category,
            amount: transaction.amount,
            isUncommon: !!transaction.uncommon,
            isCustomCategory: !!transaction.is_custom_category,
            date,
            dateISO,
            note: transaction.note,
            linkedTripId: transaction.linked_trip_id,
            isRecurringTransaction
        }
    };
};
