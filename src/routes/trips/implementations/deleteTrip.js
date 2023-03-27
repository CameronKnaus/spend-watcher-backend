const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function deleteTrip(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    // Query to get the last 5 transactions
    const { tripId } = request.body;

    if (!tripId) {
        return response.status(400).send({ error: 'Missing transaction ID' });
    }

    const STATEMENT = [
        'START TRANSACTION; ',
        `DELETE FROM trips WHERE username=${db.escape(username)} AND trip_id=${db.escape(tripId)}; `,
        `UPDATE spend_transactions SET linked_trip_id=NULL WHERE linked_trip_id=${db.escape(tripId)}`
    ].join('');

    // query the database
    db.query(STATEMENT, (error) => {
        if (error) {
            console.log(error);
            db.query('ROLLBACK;');
            return response.status(400).send();
        }

        db.query('COMMIT;');
        response.status(200).send();
    });
};
