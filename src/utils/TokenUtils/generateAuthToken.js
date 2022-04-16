const getUsernameFromToken = require('./getUsernameFromToken');
const getUserByUsername = require('../QueryUtils/getUserByUsername');
const jwt = require('jsonwebtoken');

// Only one of these parameters is required. Pass 'user' if you already have a user object returned from services
// Pass prevToken (JWT as a string) if you have an existing token and would like to generate another one from the previous token
// Pass username (string) if you have neither
// Returns null if user can't be found by the given username
module.exports = async function(prevToken, username, user) {
    if(!user) {
        // If there is no provided user, then fetch the user
        try {
            // Use the provided username, or decode the token for the username if not provided
            const name = username || getUsernameFromToken(prevToken);
            user = await getUserByUsername(name)
        }
        catch {
            return null;
        }
    }

    // Set up the JWT token options
    const options = {
        algorithm: process.env.JWT_ALGORITHM,
        expiresIn: process.env.JWT_EXPIRY,
        issuer: process.env.JWT_ISSUER,
        subject: user.username
    }

    return jwt.sign({
        persistent: true
    }, process.env.SECRET_KEY, options);
}