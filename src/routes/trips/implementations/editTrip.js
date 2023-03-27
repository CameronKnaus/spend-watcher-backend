const dayjs = require('dayjs');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function editTrip(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    const {
        tripId,
        tripName,
        startDate,
        endDate
    } = request.body;
    if (typeof tripId !== 'string' || typeof tripName !== 'string' || typeof startDate !== 'string' || (typeof endDate !== 'string')) {
        return response.status(400).send({ message: 'Invalid types given as arguments' });
    }

    if (dayjs(startDate).isAfter(dayjs(endDate))) {
        return response.status(400).send({ message: 'Invalid Date Ranges' });
    }

    const STATEMENT = `UPDATE trips SET trip_name=${db.escape(tripName)}, start_date=${db.escape(startDate)},`
        + `end_date=${db.escape(endDate)} `
        + `WHERE username=${db.escape(username)} AND trip_id=${db.escape(tripId)}`;

    // query the database
    db.query(STATEMENT, (error) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send();
    });
};
