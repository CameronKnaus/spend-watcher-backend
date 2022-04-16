const { DEV_MODE } = require('../lib/ENVIRONMENT_SETTINGS.json');

const monthInMilliseconds = 2592000000;
const CookieOptions = {
    sameSite: DEV_MODE ? 'lax' : 'None',
    httpOnly: true,
    maxAge: monthInMilliseconds,
    secure: !DEV_MODE
};

module.exports = CookieOptions;