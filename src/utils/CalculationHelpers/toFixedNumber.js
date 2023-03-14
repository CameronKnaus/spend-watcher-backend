// This function rounds a given number such that only 2 decimal places remain
module.exports = function toFixedNumber(givenNumber, decimalPlaces = 2) {
    const pow = 10 ** decimalPlaces;
    return Math.round(givenNumber * pow) / pow;
};
