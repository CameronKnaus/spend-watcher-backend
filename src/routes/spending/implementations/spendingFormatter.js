exports.getCurrentMonthTransactions = function(transactionsList) {
    return transactionsList.filter(transaction => {
        const currentDate = new Date();
        const transactionDate = new Date(transaction.date);


        return (
            currentDate.getMonth() === transactionDate.getMonth()
            && currentDate.getFullYear() === transactionDate.getFullYear()
        );
    })
}

exports.getTotalSpent = function(transactionList) {
    if(!transactionList || transactionList.length === 0) {
        return 0;
    }

    if(transactionList.length === 1) {
        return transactionList[0].amount;
    }

    transactionList.reduce((prev, current) => {
        return prev.amount + current.amount;
    }, 0);
}