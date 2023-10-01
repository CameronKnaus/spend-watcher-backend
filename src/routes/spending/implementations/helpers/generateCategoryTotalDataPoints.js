const increaseTotalByKey = require('../../../../utils/ObjectManipulation/increaseTotalByKey');
const newArrayOrPush = require('../../../../utils/ObjectManipulation/newArrayOrPush');
const getTotalDataPointTemplate = require('./getTotalDataPointTemplate');
const toFixedNumber = require('../../../../utils/CalculationHelpers/toFixedNumber');
const initAllCategories = require('./initAllCategories');

function updateGroupTotals(dataGroup, transactionAmount) {
    ++dataGroup.totalTransactionCount;
    dataGroup.totalSpent = toFixedNumber(transactionAmount + dataGroup.totalSpent);
}

function updateCategoryMinMax(minMaxByCategory, transaction, runningTotals, newValue, currentDateFormatted) {
    if (!transaction) {
        return;
    }

    const { category } = transaction;
    const newCategoryTotal = increaseTotalByKey(runningTotals, category, newValue, true);
    const minMaxValues = minMaxByCategory[category];
    if (minMaxValues.dateOfMax === currentDateFormatted || newCategoryTotal > minMaxValues.max) {
        minMaxValues.max = newCategoryTotal;
        minMaxValues.dateOfMax = currentDateFormatted;
    }

    if (minMaxValues.min === null || minMaxValues.dateOfMin === currentDateFormatted || newCategoryTotal < minMaxValues.min) {
        minMaxValues.min = newCategoryTotal;
        minMaxValues.dateOfMin = currentDateFormatted;
    }
}

function updateDataPoints(dataGroup, newValue, transaction, runningTotals, currentDateFormatted) {
    // Update min/max for total data set
    const newTotal = increaseTotalByKey(runningTotals, 'ALL', newValue, true);
    if (dataGroup.dateOfMax === currentDateFormatted || newTotal > dataGroup.max) {
        dataGroup.max = newTotal;
        dataGroup.dateOfMax = currentDateFormatted;
    }

    if (dataGroup.min === null || dataGroup.dateOfMin === currentDateFormatted || newTotal < dataGroup.min) {
        dataGroup.min = newTotal;
        dataGroup.dateOfMin = currentDateFormatted;
    }

    // Update min/max by category
    updateCategoryMinMax(dataGroup.minMaxByCategory, transaction, runningTotals, newValue, currentDateFormatted);

    const lastDataPoint = dataGroup.dataPoints.at(-1) || {};
    const { ALL, ...runningTotalsByCategory } = runningTotals;
    if (lastDataPoint.date === currentDateFormatted) {
        // Add to existing data point
        lastDataPoint.value = newTotal;
        lastDataPoint.valuesByCategory = {
            ...runningTotalsByCategory
        };

        // Add transaction data if present
        if (transaction) {
            const { category, transactionId } = transaction;
            lastDataPoint.transactionIdList.push(transactionId);
            newArrayOrPush(lastDataPoint.transactionIdListByCategory, category, transactionId);
        }
    } else {
        const newDataPoint = {
            date: currentDateFormatted,
            value: newTotal,
            valuesByCategory: {
                ...runningTotalsByCategory
            },
            transactionIdList: [],
            transactionIdListByCategory: {}
        };

        // Add transaction data if present
        if (transaction) {
            const { category, transactionId } = transaction;

            newDataPoint.transactionIdList = [transactionId];
            newDataPoint.transactionIdListByCategory = {
                [category]: [transactionId]
            };
        }

        // Push new data point
        dataGroup.dataPoints.push(newDataPoint);
    }
}

module.exports = function generateCategoryTotalDataPoints(allCategories, transactionsGroupedByDate, transactionsMappedById, startDate, endDate) {
    const payload = getTotalDataPointTemplate(allCategories);
    const allCategoriesAtZero = initAllCategories(allCategories, 0);

    const cumulativeTotalsByCategory = {
        ALL: 0,
        ...allCategoriesAtZero
    };
    const cumulativeTransactionAmountsByCategory = {
        ALL: 0,
        ...allCategoriesAtZero
    };

    // Loop through each day from start to end and accumulate totals accordingly
    for (let dateIndex = startDate; dateIndex.isSameOrBefore(endDate, 'day'); dateIndex = dateIndex.add(1, 'day')) {
        const dailyTotalsByCategory = {
            ALL: 0,
            ...allCategoriesAtZero
        };
        const dailyTransactionAmountsByCategory = {
            ALL: 0,
            ...allCategoriesAtZero
        };
        const currentDateFormatted = dateIndex.format('MM/DD/YY');

        const dateGroup = transactionsGroupedByDate[currentDateFormatted];
        if (!dateGroup || !dateGroup.length) {
            updateDataPoints(payload.cumulativeTotals, 0, null, cumulativeTotalsByCategory, currentDateFormatted);
            updateDataPoints(payload.dailyTotals, 0, null, dailyTotalsByCategory, currentDateFormatted);
            updateDataPoints(payload.cumulativeTransactionAmounts, 0, null, cumulativeTransactionAmountsByCategory, currentDateFormatted);
            updateDataPoints(payload.dailyTransactionAmounts, 0, null, dailyTransactionAmountsByCategory, currentDateFormatted);
            continue;
        }

        // Loop through all transactions on this given date
        dateGroup.forEach(({ transactionId, isRecurringTransaction, recurringSpendId }) => {
            const transaction = transactionsMappedById[isRecurringTransaction ? recurringSpendId : transactionId];
            const { amount } = transaction;

            updateGroupTotals(payload, amount);
            updateDataPoints(payload.cumulativeTotals, amount, transaction, cumulativeTotalsByCategory, currentDateFormatted);
            updateDataPoints(payload.dailyTotals, amount, transaction, dailyTotalsByCategory, currentDateFormatted);
            updateDataPoints(payload.cumulativeTransactionAmounts, 1, transaction, cumulativeTransactionAmountsByCategory, currentDateFormatted);
            updateDataPoints(payload.dailyTransactionAmounts, 1, transaction, dailyTransactionAmountsByCategory, currentDateFormatted);
        });
    }

    return payload;
};
