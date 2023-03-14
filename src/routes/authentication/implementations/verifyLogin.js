const getUsernameFromToken = require('../../../utils/TokenUtils/getUsernameFromToken');

module.exports = (request, response) => {
    // If the verifyAuthToken middleware hasn't responded with an error by now, then we have a valid token
    const { token } = request.cookies;

    return response.status(200).send({
        username: getUsernameFromToken(token)
    });
};
