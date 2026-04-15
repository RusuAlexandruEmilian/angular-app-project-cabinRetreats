const jwt = require('jsonwebtoken');
const pool = require('../config/db.js');



const refresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.sendStatus(403);
            
            try{
                const activeUserSession = await pool.query(
                    `Select u.id from users u 
                     Inner join rjwt on rjwt.user_id = u.id
                     where u.id=$1 and rjwt.refresh_token=$2
                    `, [decoded.userId, refreshToken]);
                if(!activeUserSession.rows[0]) return res.sendStatus(403);

                
                const accessToken = jwt.sign(
                { "userId": decoded.userId },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s' }
                );
                res.json({ accessToken: accessToken })
                
            }catch(e){
                res.status(500).json({error: e.message});
                console.log(e);
            }
                
        }
        
    );
    
};


module.exports = { refresh };