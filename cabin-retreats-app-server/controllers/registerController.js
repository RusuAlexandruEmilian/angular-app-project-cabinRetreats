const bcrypt = require('bcrypt');
const pool = require('../config/db.js');




const register = async (req, res) => {
  const { email, password, name, surname } = req.body;
  if(!email || !password || !name || !surname){
    return res.status(400).json({'message': 'All details required!'})
  };

  try{
    const duplicate = await pool.query('Select email from users where email=$1', [email]);
    res.status(200).json({message: 'User successfully created'});
    if (duplicate.rows.length > 0){
      return res.sendStatus(409);
    }
  
    bcrypt.hash(password, 10, async (err, hpassword) => {
      if(err) return res.status(500).json({error: err});
        await pool.query('Insert into users (email, password, name, surname, created_at) values ($1, $2, $3, $4, NOW())', [email, hpassword, name, surname]);
        res.status(201).json({ message: "User created!" });
    
    });
  }catch(e){
    res.status(500).json({error: e.message});
  }
  


 };


 module.exports = { register };