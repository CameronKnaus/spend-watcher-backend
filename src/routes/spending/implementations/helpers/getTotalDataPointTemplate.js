const initAllCategories = require('./initAllCategories');

function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
}

module.exports = function getTotalDataPointTemplate(allCategories) {
    const template = initAllCategories(allCategories, {
        max: 0,
        min: null,
        dateOfMax: null,
        dateOfMin: null
    });

    return {
        totalTransactionCount: 0,
        totalSpent: 0,
        cumulativeTotals: {
            max: 0,
            min: null,
            minMaxByCategory: deepClone(template),
            dataPoints: []
        },
        dailyTotals: {
            max: 0,
            min: null,
            minMaxByCategory: deepClone(template),
            dataPoints: []
        },
        cumulativeTransactionAmounts: {
            max: 0,
            min: null,
            minMaxByCategory: deepClone(template),
            dataPoints: []
        },
        dailyTransactionAmounts: {
            max: 0,
            min: null,
            minMaxByCategory: deepClone(template),
            dataPoints: []
        }
    };
};

// EXAMPLE --
// dailyTransactionAmounts: {
//     max: 0,
//     dateOfMax: '05/15/1998'
//     min: null,
//     dateOfMin: '05/15/1998'
//     minMaxByCategory: {
// RESTAURANTS: {
//     min: 0,
//     max: 15,
//     minDate: '05/15/1998',
//     maxDate: '05/15/1998'
// },
//         GROCERIES: 12.16
//     },
//     dataPoints: [
//         {
//             date: '05/15/1998',
//             value: 100,
//             valuesByCategory: {
//                 RESTAURANTS: 50,
//                 GROCERIES: 40,
//                 ENTERTAINMENT: 10
//             },
//             transactionIdList: ['123', '123'],
//             transactionIdListByCategory: {
//                 RESTAURANTS: ['123', '123'],
//                 GROCERIES: ['512']
//             }
//         }
//     ]
// }
