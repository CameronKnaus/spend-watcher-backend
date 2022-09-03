// This function rounds a given number such that only 2 decimal places remain
module.exports = function(givenNumber, decimalPlaces = 2) {
    const pow = Math.pow(10, decimalPlaces);
    return Math.round(givenNumber * pow) / pow;
}