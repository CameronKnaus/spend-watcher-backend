const { v4: uuidv4 } = require('uuid');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function newTrip(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    const {
        tripName,
        startDate,
        endDate
    } = request.body;
    if (typeof tripName !== 'string' || typeof startDate !== 'string' || (typeof endDate !== 'string')) {
        return response.status(400).send({ message: 'Invalid types given as arguments' });
    }

    const uniqueId = uuidv4();
    const STATEMENT = 'INSERT INTO trips (trip_id, username, trip_name, start_date, end_date) VALUES ('
        + `${db.escape(uniqueId)}, ${db.escape(username)}, ${db.escape(tripName)}, ${db.escape(startDate)}, ${db.escape(endDate)})`;

    // query the database
    db.query(STATEMENT, (error) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send();
    });
};
