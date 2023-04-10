const dayjs = require('dayjs');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function fetchAllTrips(request, response) {
    // Resolve the username from the token
    const username = getUsernameFromToken(request.cookies.token);

    const { currentDate } = request.query;

    // Query to get the last 5 transactions
    const STATEMENT = `SELECT * FROM trips WHERE username=${db.escape(username)} ORDER BY start_date DESC;`;

    // query the database
    db.query(STATEMENT, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        if (!results) {
            return response.status(200).send({ tripsList: [] });
        }

        const TOTALS_STATEMENT = `SELECT SUM(amount) AS total, linked_trip_id FROM spend_transactions WHERE username=${db.escape(username)} AND linked_trip_id IS NOT NULL GROUP BY linked_trip_id`;
        db.query(TOTALS_STATEMENT, (transactionsError, totalsResults) => {
            if (transactionsError) {
                console.log(transactionsError);
                return response.status(400).send();
            }

            const totalsMap = {};
            totalsResults.forEach((total) => {
                totalsMap[total.linked_trip_id] = total.total;
            });

            const tripsList = results.map(({
                trip_name, trip_id, start_date, end_date
            }) => ({
                tripName: trip_name,
                tripId: trip_id,
                startDate: dayjs(start_date).format('MM/DD/YYYY'),
                endDate: dayjs(end_date).format('MM/DD/YYYY'),
                tripTotal: totalsMap[trip_id] || 0,
                tripIsActive: dayjs(currentDate).isBetween(dayjs(start_date), dayjs(end_date), 'day', '[]')
            }));

            response.status(200).send({
                tripsList
            });
        });
    });
};
