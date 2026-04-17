const jwt = require('jsonwebtoken');

const verifyJwt = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader) return res.status(400).json({
        code: 'UNAUTHORIZED ACCESS',
        message: 'User is not logged in'
    });
    
    const bearerToken = authHeader.split(' ')[1];
    
    jwt.verify(
        bearerToken,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(401);
            req.userId = decoded.userId;
            next(); 
        }
    );

}

module.exports = verifyJwt;