const db = require('../../../lib/db');
const generateAuthToken = require('../../../utils/TokenUtils/generateAuthToken');
const CookieOptions = require("../../../lib/CookieOptions");
const bcrypt = require('bcryptjs');

// Processes the verification and login of a user
module.exports = (request, response) => {
    /* If this was a production level app we would not be sending passwords around in plain text*/
    const username = request.body.username;
    const email = request.body.email;
    const password = request.body.password;

    // Check to see if the username, or email is a valid user (both are submitted as username
    db.query(
        `SELECT * FROM user_information.account_info WHERE user_email=${db.escape(email)} OR username=${db.escape(username)};`,
        (error, result) => {
            if(error || !result.length) {
                // The username / email was not found or is invalid
                return response.status(401).send({
                    message: 'Username or password was incorrect.'
                });
            }

            // Note that result[0] holds all of the user data so for clarity convert
            const user = result[0];

            // Since the user was found, check the password
            bcrypt.compare(
                password, // Decoded Password
                user.password, // Stored Hashed password
                (bErr, bResult) => {
                    // If service failure
                    if(bErr) {
                        return response.status(400).send({
                            cause: 'service_failure'
                        });
                    }
                    // If Correct password
                    if(bResult) {
                        // Prepare the token for response and send
                        generateAuthToken(null, null, user)
                            .then((token) => {
                                if(!token) {
                                    return response.status(400).send({
                                        message: 'Failed to create authentication token.'
                                    });
                                }
                                response.cookie("token", token, CookieOptions);

                                return response.status(200).send({
                                    username: user.username
                                });
                            })
                            .catch(() => {
                                // Password was incorrect
                                return response.status(401).send({
                                    message: 'Username or password is incorrect.',
                                    cause: 'invalid_credentials'
                                });
                            });
                    } else {
                        // Else password was incorrect
                        return response.status(401).send({
                            msg: 'Username or password is incorrect.',
                            cause: 'invalid_credentials'
                        });
                    }
                }
            )
        }
    );
}