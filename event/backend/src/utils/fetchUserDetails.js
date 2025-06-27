const jwt = require("jsonwebtoken");
const AUTHENTICATED_SIGNATURE = process.env.JWTSECRET;

const fetchUserDetails = async (req, res, next) => {
    // Verifying the authtoken and decoding the user details
    const authtoken = req.header("auth-token");
    if(!authtoken) {
        return res.status(401).send({error: "Oopps... You are not eligible to proceed."});
    }
    try {
        const data = await jwt.verify(authtoken, AUTHENTICATED_SIGNATURE);
        if(data.user === undefined) {
            return res.status(401).json({error: 'invalid token!'});
        }
        req.user = data.user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).send({
            error: error.message, 
            err: "Internal server issues... please try again later.", 
            place: "fetchUserDetails"
        });
    }
}

module.exports = fetchUserDetails;