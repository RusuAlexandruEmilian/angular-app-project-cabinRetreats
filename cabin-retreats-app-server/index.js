const express = require('express');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const db = require('./config/db.js');
const cabinsDb = require('./cabins');
const cookieParser = require('cookie-parser');
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
const verifyJwt = require('./middleware/verifyJwt.js');
const cron = require('node-cron');
require('dotenv').config();



app.use(express.json());

app.use(cookieParser());

cron.schedule('00 2 * * * ', async () => {
  await db.query("Delete from rjwt where created_at < NOW() - INTERVAL '15 minutes'");
  console.log("Old refresh tokens Deleted!");
});


app.use('/authenticate', require('./routes/authenticate'));
app.use('/register', require('./routes/register'));
app.use('/refreshToken', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.get('/', async (req, res) => {
    /*
    try{
      const allCabins = await db.query('Select * from cabin');
      res.send(allCabins.rows);
    } catch (err) {
      console.error('Database Error:', err.message);
    
      res.status(500).json({ 
        success: false, 
        error: 'Database query failed' 
      });
    }
      */
     res.json(cabinsDb);
});

app.get('/protected', verifyJwt, (req, res) => {
  res.json(cabinsDb);
});
app.get('/search/cabinId', async (req, res) => {
  const { cabin_id } = req.query;
  try{
      const cabin = await db.query('Select * from cabin WHERE id = $1', [cabin_id]);
      res.send(cabin.rows);
    } catch (err) {
      console.error('Database Error:', err.message);
    
      res.status(500).json({ 
        success: false, 
        error: 'Database query failed' 
      });
    }
});


    // GET endpoint to check cabin availability
app.get('/api/cabins/availability', async (req, res) => {
    const { start_date, end_date, destination, pets} = req.query;
    // Validate input parameters
    if (!start_date || !end_date || !destination || !pets) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both start_date and end_date are required query parameters'
      });
    }
    
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid date format. Please use YYYY-MM-DD format'
      });
    }
    
    if (endDate < startDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date cannot be before start date'
      });
    }
    
    /*
    sql`
      SELECT c. * 
      FROM cabin c 
      WHERE c.id NOT IN (
	      SELECT DISTINCT b.cabin_id
        FROM bookings b
        WHERE (
		      (b.start_date <= ${start_date} AND b.end_date > ${start_date}) OR
          (b.start_date < ${end_date} AND b.end_date >= ${end_date}) OR
          (b.start_date >= ${start_date} AND b.end_date <= ${end_date})
        )
      )
    
      AND (
        c.location = ${destination} OR		
        c.county= ${destination} OR
        c.name = ${destination} 
		
      )

      And (${pets} = 0 OR c.pets_allowed = ${pets})
    
    `
    .then(availableCabins =>{
      res.json(availableCabins);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Database query failed');
    });
   */
  const sql = `
    SELECT c. * 
      FROM cabin c 
      WHERE c.id NOT IN (
	      SELECT DISTINCT b.cabin_id
        FROM bookings b
        WHERE (
		      (b.start_date <= $1 AND b.end_date > $1) OR
          (b.start_date < $2 AND b.end_date >= $2) OR
          (b.start_date >= $1 AND b.end_date <= $2)
        )
      )
    
      AND (
        c.location = $3 OR		
        c.county= $3 OR
        c.name = $3 
		
      )

      And ($4 = 0 OR c.pets_allowed = $4)
  `;
  try{
      const availableCabins = await db.query(sql, [start_date, end_date, destination, pets]);
      res.send(availableCabins.rows);
    } catch (err) {
      console.error('Database Error:', err.message);
    
      res.status(500).json({ 
        success: false, 
        error: 'Database query failed' 
      });
    }
  
});


// *******  Search cabin by name or location or county according to characters in the search input  ******

app.get('/cabin/search/byDesinationInput', async (req, res) => {
  
  const { input_characters } = req.query;

  //query1 = "SELECT DISTINCT county, location FROM cabin WHERE county LIKE ? OR location LIKE ?"
  //query2 = "SELECT DISTINCT county, location, name FROM cabin WHERE county LIKE ? OR location LIKE ? OR name LIKE ?"

  
  const search_characters = input_characters + '%';

  /*
  if(input_characters.length === 1){
    
    
    sql`
      SELECT DISTINCT county, location FROM cabin WHERE county LIKE ${param} OR location LIKE ${param}
    `
    .then(results => {
      const seen = new Set();
      const filtered = [];

      results.forEach(row => {
        if(row.county[0].toLowerCase() === input_characters.toLocaleLowerCase()){
          if(!seen.has(row.county)){
            filtered.push({ county: row.county });
            seen.add(row.county);
          }
        }


        if(row.location[0].toLowerCase() === input_characters.toLocaleLowerCase()){
            filtered.push(row);            
        }
      })
      res.json(filtered);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Database query failed');
    })
  }
  */
  
  if(input_characters.length === 1){
    const sql = 'Select Distinct county, location FROM cabin WHERE county ILIKE $1 OR location ILIKE $1';
    try{
      const foundLocations = await db.query(sql, [search_characters]);
      const seen = new Set();
      const filtered = [];
      foundLocations.rows.forEach(row => {
        if(row.county[0].toLowerCase() === input_characters.toLocaleLowerCase()){
          if(!seen.has(row.county)){
            filtered.push({ county: row.county });
            seen.add(row.county);
          }
        }


        if(row.location[0].toLowerCase() === input_characters.toLocaleLowerCase()){
            filtered.push(row);            
        }
      })
      res.json(filtered);
    } catch (err) {
      console.error('Database Error:', err.message);
    
      res.status(500).json({ 
        success: false, 
        error: 'Database query failed' 
      });
    }

  }

  /*
  if(input_characters.length > 1){
    
    sql`
    SELECT DISTINCT county, location, name FROM cabin WHERE county LIKE ${param} OR location LIKE ${param} OR name LIKE ${param}
    `
    .then(results => {
      const seen = new Set();
      const filtered = [];
  
      results.forEach(row => {
        if (row.county && row.county.toLowerCase().startsWith(input_characters.toLowerCase())) {
          const val = row.county;
          if (!seen.has(`county:${val}`)) {
            filtered.push({ county: val });
            seen.add(`county:${val}`);
          }
        }
  
        if (row.location && row.location.toLowerCase().startsWith(input_characters.toLowerCase())) {
          const val = row.location;
          if (!seen.has(`location:${val}`)) {
            filtered.push({ county: row.county, location: val });
            seen.add(`location:${val}`);
          }
          
        }

        if (row.name && row.name.toLowerCase().startsWith(input_characters.toLowerCase())) {
          const val = row.name;
          if (!seen.has(`name:${val}`)) {
            filtered.push({ county: row.county, location: row.location, name: val });
            seen.add(`name:${val}`);
          }
          
        }
      });
  
      res.json(filtered);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Database query failed');
    })
  }
  */

  if(input_characters.length > 1){
    const sql = 'SELECT DISTINCT county, location, name FROM cabin WHERE county ILIKE $1 OR location ILIKE $1 OR name ILIKE $1'
    try{
      const foundLocations = await db.query(sql, [search_characters]);
      const seen = new Set();
      const filtered = [];
  
      foundLocations.rows.forEach(row => {
        if (row.county && row.county.toLowerCase().startsWith(input_characters.toLowerCase())) {
          const val = row.county;
          if (!seen.has(`county:${val}`)) {
            filtered.push({ county: val });
            seen.add(`county:${val}`);
          }
        }
  
        if (row.location && row.location.toLowerCase().startsWith(input_characters.toLowerCase())) {
          const val = row.location;
          if (!seen.has(`location:${val}`)) {
            filtered.push({ county: row.county, location: val });
            seen.add(`location:${val}`);
          }
          
        }

        if (row.name && row.name.toLowerCase().startsWith(input_characters.toLowerCase())) {
          const val = row.name;
          if (!seen.has(`name:${val}`)) {
            filtered.push({ county: row.county, location: row.location, name: val });
            seen.add(`name:${val}`);
          }
          
        }
      });
  
      res.json(filtered);
    } catch (err) {
      console.error('Database Error:', err.message);
    
      res.status(500).json({ 
        success: false, 
        error: 'Database query failed' 
      });
    }
  }

});



app.post('/book',  verifyJwt, async (req, res) =>{
  
  const { cabin_id, booking_details } = req.body;
  const userId = req.userId;
  if(!userId || !cabin_id || !booking_details) return res.status(400).json({
    code: 'MISSING BOOKING DATA',
    message: 'Required booking information missing'
  });
  // try{
  //   await db.query(`Insert into bookings 
  //                   (user_id, cabin_id, created_at, start_date, end_date) 
  //                   Values ($1, $2, Now(), $3, $4)`,
  //                   [userId, cabin_id, booking_details.check_in, booking_details.check_out]
  //   );
  //   res.status(200).json({message: 'Booking created successfully'})
  // } catch (err) {
  //     console.error('Database Error:', err.message);
    
  //     res.status(500).json({ 
  //       success: false, 
  //       error: 'Database query failed' 
  //     });
  // }

});



//Get reviews for cabin by cabin_id
app.get('/cabin/reviews', async (req, res) => {
  const {cabin_id} = req.query;
  try{
      const reviews = await db.query('Select * from reviews where cabin_id=$1', [cabin_id]);
      res.send(reviews.rows);
    } catch (err) {
      console.error('Database Error:', err.message);
    
      res.status(500).json({ 
        success: false, 
        error: 'Database query failed' 
      });
    }
      
    
 
    
   
});

app.get('/search/user/name', async (req, res) =>{
  const {user_id} = req.query
   try{
      const user = await db.query('SELECT name FROM users WHERE id = $1', [user_id]);
      res.send(user.rows);
    } catch (err) {
      console.error('Database Error:', err.message);
    
      res.status(500).json({ 
        success: false, 
        error: 'Database query failed' 
      });
    }
});


//Create a review

app.post('/create/review', (req, res) => {

  const {email, password, cabin_id, review, rating} = req.body;
  
  sql`
  SELECT * FROM users WHERE email = ${email}
  `
  .then(user => {
    if(user.length > 0){
      
        bcrypt.compare(password, user[0].password, (err, match) => {
          if (err) {
            return res.status(500).json({ message: 'Error comparing passwords' });
          }
  
          if(match){
            //It also creates the review by  calling the createReview function within it
            check_booking_and_review(user[0].id);
          }else{
            res.json({message: "Wrong email or password"});
          }
          
        });
      }else{
        res.json({message: "Wrong email or password"});
      }
  })
  .catch(err => {
    console.error(err);
    res.status(500).send('Database query failed');
  })


  function check_booking_and_review(user_id){
    
    sql`
    SELECT 
    b.user_id,
    b.cabin_id,
    CASE 
        WHEN b.user_id IS NOT NULL AND r.user_id IS NOT NULL THEN 'Booking and Review Found'
        WHEN b.user_id IS NOT NULL AND r.user_id IS NULL THEN 'Booking Found, No Review'
        ELSE 'No Booking Found'
    END AS status
    FROM 
        bookings b
    LEFT JOIN 
        reviews r 
        ON b.user_id = r.user_id 
        AND b.cabin_id = r.cabin_id
    WHERE 
        b.user_id = ${user_id}   
        AND b.cabin_id = ${cabin_id}
    `
    .then(result => {
      if(result.length > 0){
        if(result[0].status === "Booking and Review Found"){
          res.json({message: "Booking and Review Found"});
        }else{
          createReview(user_id);
        }
      }else{
        res.json({message: "Booking not found"});
      }
      
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Database query failed');
    })
  }



  function createReview(user_id){
  
    sql`
    INSERT INTO reviews (user_id, cabin_id, created_at, review, rating) VALUES (${user_id}, ${cabin_id}, NOW(), ${review}, ${rating})
    `
    .then(success => {
      sql`
      SELECT * FROM reviews WHERE cabin_id = ${cabin_id}
      `
      .then(reviews => {
        
        let ratingsSum = 0;
        let cabinRating;
        for(let j = 0; j < reviews.length; j++){
          ratingsSum = ratingsSum + parseInt(reviews[j].rating);
        };
        cabinRating = ratingsSum / reviews.length;
        console.log(cabinRating);
        
      sql`
      UPDATE cabin SET rating = ${cabinRating} WHERE id = ${cabin_id} 
      `
      .then(ratingUpdated => {
        
        res.json({message: "Review created successfully"})
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Database query failed');
      })
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Database query failed');
      })

    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Database query failed');
    })
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})