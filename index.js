require("dotenv").config({path: './src/lib/variables.env'});
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { DEV_MODE, PROD_DOMAIN, LOCAL_DOMAIN } = require('./src/lib/ENVIRONMENT_SETTINGS.json');

let allowedOrigin = PROD_DOMAIN;
if(DEV_MODE) {
    console.log("DEV MODE IS ON");
    allowedOrigin = LOCAL_DOMAIN;
    console.log(`Listening for requests from ${allowedOrigin}`);
}

// Define the express app
const app = express();

// Provide ability to parse cookies (for JWT tokens)
app.use(cookieParser());

// Cross Origin Resource Sharing (CORS) settings
app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", allowedOrigin);
    res.set("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    res.set("Access-Control-Request-Method: GET, POST");
    res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token, Authorization");
    res.set('Access-Control-Allow-Credentials', 'true');
    if(req.method === 'OPTIONS') {
        res.end();
    }
    else {
        next();
    }
});

// Equip app with json manipulation capabilities
app.use(express.json());

// Enhance security of the app with helmet
app.use(helmet());

// Add routes
const authRoutes = require('./src/routes/authentication/authRouter'); // Routes concerning authentication
app.use('/api/auth', authRoutes);

// Define the port
const PORT = process.env.PORT || 4000;

// Starting our server.
app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
