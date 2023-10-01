module.exports = function initAllCategories(allCategories, initValue = 0) {
    const payload = {};

    allCategories.forEach((category) => {
        payload[category] = initValue;
    });

    return payload;
};
