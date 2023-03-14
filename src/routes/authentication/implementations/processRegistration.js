const bcrypt = require('bcryptjs');
const db = require('../../../lib/db');
const generateAuthToken = require('../../../utils/TokenUtils/generateAuthToken');
const CookieOptions = require('../../../lib/CookieOptions');

// Process the registration of a new user
module.exports = (request, response) => {
    /* If this was a production level app we would not be sending passwords around in plain text */
    const { username } = request.body;
    const { email } = request.body;
    const { password } = request.body;

    // Check if email is already in use
    db.query(
        `SELECT * FROM user_information.account_info WHERE user_email=${db.escape(email)};`,
        (emailCheckError, emailCheckResult) => {
            if (emailCheckError) {
                return response.sendStatus(400);
            }

            // If email is already in use
            if (emailCheckResult.length) {
                return response.status(409).send({
                    message: 'This email is already taken.'
                });
            }
            // Check if username is already in use
            db.query(
                `SELECT * FROM user_information.account_info WHERE username=${db.escape(username)};`,
                (userCheckError, userCheckResult) => {
                    if (userCheckError) {
                        return response.status(400).send();
                    }

                    // If username is already in use
                    if (userCheckResult.length) {
                        return response.status(409).send({
                            message: 'This username is already taken.'
                        });
                    }

                    // The username and email are both available so proceed with registration steps
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (err) {
                            return response.sendStatus(500);
                        }
                        // Create the query for inserting the new user
                        const INSERTION_QUERY = `INSERT INTO user_information.account_info (user_email, username,
                                     password) VALUES (${db.escape(email)}, ${db.escape(username)}, ${db.escape(hash)});`;

                        // The password has been hashed and is ready to enter the database
                        db.query(
                            INSERTION_QUERY,
                            (error) => {
                                if (error) {
                                    return response.sendStatus(400);
                                }

                                // Token generation requires a user object with a username and permissions (create a temp to satisfy requirements)
                                const user = {
                                    username,
                                    permission: 'standard',
                                    ui_locale: request.body.ui_locale,
                                    core_locale: request.body.core_locale
                                };

                                // Prepare the token for response and send
                                generateAuthToken(null, null, user).then((token) => {
                                    if (!token) {
                                        return response.status(400).send({
                                            message: 'Failed to create authentication token'
                                        });
                                    }

                                    response.cookie('token', token, CookieOptions);
                                    return response.status(201).send({
                                        username: user.username
                                    });
                                });
                            }
                        );
                    });
                }
            );
        }
    );
};
