const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const { transactionId } = request.body;

    if(!transactionId) {
        return response.status(400).send({error: 'Missing transaction ID'})
    }

    let STATEMENT = `DELETE FROM spend_transactions WHERE username="${username}" AND transaction_id=${transactionId}`

    // query the database
    db.query(STATEMENT, function(error) {
        if(error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send();
    });
}