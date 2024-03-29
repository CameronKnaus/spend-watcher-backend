exports.getCurrentMonthTransactions = function getCurrentMonthTransactions(transactionsList) {
    return transactionsList.filter((transaction) => {
        const currentDate = new Date();
        const transactionDate = new Date(transaction.date);

        return (
            currentDate.getMonth() === transactionDate.getMonth()
            && currentDate.getFullYear() === transactionDate.getFullYear()
        );
    });
};

exports.getTotalSpent = function getTotalSpent(transactionList) {
    if (!transactionList || transactionList.length === 0) {
        return 0;
    }

    if (transactionList.length === 1) {
        return transactionList[0].amount;
    }

    return transactionList.reduce((prev, current) => (
        { amount: prev.amount + current.amount }
    ), { amount: 0 }).amount.toFixed(2);
};
