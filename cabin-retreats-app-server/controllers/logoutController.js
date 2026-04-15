const pool = require('../config/db.js');


const logout = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);
    //res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try{
        await pool.query('Delete from rjwt where refresh_token=$1', [cookies.jwt]);
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
        res.sendStatus(204);
    }catch(e){
        res.status(500).json({error: e.message})
    }
};


module.exports = { logout };