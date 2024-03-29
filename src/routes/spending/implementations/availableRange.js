const dayjs = require('dayjs');
const db = require('../../../lib/db');
const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = function availableRange(request, response) {
    const username = getUsernameFromToken(request.cookies.token);

    const STATEMENT = `SELECT MIN(date) as min, MAX(date) as max FROM spend_transactions WHERE username="${username}"`;

    // query the database
    db.query(STATEMENT, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send();
        }

        response.status(200).send({
            minDate: dayjs(results[0].min).format('MM/DD/YYYY'),
            maxDate: dayjs(results[0].max).format('MM/DD/YYYY')
        });
    });
};
