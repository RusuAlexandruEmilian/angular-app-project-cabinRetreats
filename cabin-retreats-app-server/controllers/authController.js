const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db.js');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({message: "Username and password required!"});

  try{
    const userFound = await pool.query("Select id, email, password from users where email=$1", [email]);
    if(!userFound.rows[0]) return res.status(404).json({error:"User does not exist!"});
    const hashedPassword = userFound.rows[0].password;
    bcrypt.compare(password, hashedPassword, async (err, match) => {
      if(err){
        return res.status(500).json({error: err});
      }
      if (!match) return res.sendStatus(401);
      
      const accessToken = jwt.sign(
        {"userId": userFound.rows[0].id}, 
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: '30s'}
      );

      
       const refreshToken = jwt.sign(
        {"userId": userFound.rows[0].id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '60s'}
       );
      
       await pool.query('Insert into rjwt (user_id, refresh_token, created_at) Values ($1, $2, NOW())', [userFound.rows[0].id, refreshToken]);

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 60*1000,  
        path: '/'
      })
      
      
      res.status(200).json({ accessToken: accessToken});
    });
    
  }catch(e){
    res.status(500).json({error: e.message});
  }
  
};

module.exports = { login };