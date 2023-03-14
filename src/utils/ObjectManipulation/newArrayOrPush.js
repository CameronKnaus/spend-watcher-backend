// If the targetKey of a given object is already an array, newElement will be pushed.
// If it's not an array, an array with newElement at index 0 will be created.
module.exports = function newArrayOrPush(object, targetKey, newElement) {
    if (typeof targetKey !== 'string' || typeof object !== 'object') {
        return;
    }

    // Array exists
    if (Array.isArray(object[targetKey])) {
        object[targetKey].push(newElement);
        return;
    }

    // Array doesn't exist, create a new one
    object[targetKey] = [newElement];
};
