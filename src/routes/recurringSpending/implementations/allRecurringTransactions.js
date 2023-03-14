const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');
const fetchAllRecurringTransactions = require('../helpers/fetchAllRecurringTransactions');

module.exports = async function allRecurringTransactions(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    fetchAllRecurringTransactions(username).then((payload) => {
        response.status(200).send(payload);
    }).catch(() => {
        response.status(400).send();
    });
};
