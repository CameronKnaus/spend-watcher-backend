const db = require('../../lib/db');

// Helper for querying the database and getting user profile information
// by username, returns null if user not found
module.exports = function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT * FROM user_information.account_info WHERE username="${username}";`,
            (error, result) => {
                if (error || !result.length) {
                    reject();
                }

                resolve(result[0]);
            }
        );
    });
};
