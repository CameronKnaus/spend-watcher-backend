require('dotenv').config({ path: './src/lib/variables.env' });
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const { DEV_MODE, PROD_DOMAIN, LOCAL_DOMAIN } = require('./src/lib/ENVIRONMENT_SETTINGS.json');

// Route imports
const authRoutes = require('./src/routes/authentication/authRouter'); // Routes concerning authentication
const spendingRoutes = require('./src/routes/spending/spendingRouter');
const recurringSpendingRoutes = require('./src/routes/recurringSpending/recurringSpendingRouter');
const accountRoutes = require('./src/routes/accounts/accountsRouter');
const tripRoutes = require('./src/routes/trips/tripsRouter');

let allowedOrigin = PROD_DOMAIN;
if (DEV_MODE) {
    console.log('DEV MODE IS ON');
    allowedOrigin = LOCAL_DOMAIN;
    console.log(`Listening for requests from ${allowedOrigin}`);
}

// Augment dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

// Define the express app
const app = express();

// Provide ability to parse cookies (for JWT tokens)
app.use(cookieParser());

// Cross Origin Resource Sharing (CORS) settings
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', allowedOrigin);
    res.set('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    res.set('Access-Control-Request-Method: GET, POST');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-token, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.end();
    } else {
        next();
    }
});

// Equip app with json manipulation capabilities
app.use(express.json());

// Enhance security of the app with helmet
app.use(helmet());

// Add routes
app.use('/api/auth', authRoutes);
app.use('/api/spending', spendingRoutes);
app.use('/api/recurring', recurringSpendingRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/trips', tripRoutes);

// Define the port
const PORT = process.env.PORT || 4000;

// Starting our server.
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
