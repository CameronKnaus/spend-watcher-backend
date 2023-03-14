const jwt = require('jsonwebtoken');

// Verify that the current token is legal
module.exports = (request, response, next) => {
    const { token } = request.cookies;
    if (!token) {
        // No token provided, error out
        return response.status(403).send({
            message: 'Not authorized to access this endpoint'
        });
    }
    jwt.verify(token, process.env.SECRET_KEY, (err) => {
        if (err) {
            response.clearCookie('token');
            return response.status(403).send({
                message: 'Please login again'
            });
        }

        next();
    });
};
