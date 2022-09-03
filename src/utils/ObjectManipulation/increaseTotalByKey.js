// TODO: maybe think of a better name
// If the targetKey of a given object is defined then it will add the valueToAdd to the current value at targetKey
// If the targetKey is undefined then it will be set to the value of valueToAdd
module.exports = function(object, targetKey, valueToAdd) {
    if(typeof targetKey !== 'string' || typeof object !== 'object' || typeof valueToAdd !== 'number') {
        return;
    }

    object[targetKey] = object[targetKey] ? (object[targetKey] + valueToAdd) : valueToAdd;
}