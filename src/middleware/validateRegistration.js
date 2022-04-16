// Checks if the username and password are of valid length
module.exports = function(request, response, next) {
    const password = request.body.password;
    const email = request.body.email;
    const username = request.body.username;

    // Error if the provided username is empty
    if(!username || username.length === 0) {
        return response.status(401).send({
            message: "Username is required for registration"
        });
    }

    // Username must be at least two characters long
    if(!username || username.length > 20) {
        return response.status(401).send({
            message: "The username must be less than 20 characters long"
        });
    }

    if(!email) {
        return response.status(401).send({
            message: "Email address is required for registration."
        })
    }

    // Password must be at least 8 characters
    if(!password || password.length < 8) {
        return response.status(401).send({
            message: "The password must be at least 8 characters long"
        });
    }

    next();
}