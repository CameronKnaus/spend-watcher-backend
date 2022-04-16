const db = require('../lib/db');

// Helper for querying the database and getting user profile information by email, returns null if user not found
async function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT * FROM user_information.account_info WHERE user_email="${db.escape(email)}";`,
            (error, result) => {
                if (error) {
                    reject({reason: 'db_error'});
                }

                if(!result.length) {
                    // No user
                    reject({reason: 'not_found'})
                }

                resolve(result[0]);
            }
        );
    });
}

exports.getUserByEmail = getUserByEmail;