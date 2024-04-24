//index.js
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Users = require('./models/users');
const Exercises = require('./models/exercises');
const Logs = require('./models/logs');
const Exercise = require('./models/exercises');

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('connected to mongodb successfully'))
.catch((e)=>console.error('Error connecting to mongodb',e));

app.use(bodyParser.urlencoded({extended:true}));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//add new user
app.post('/api/users',async (req,res)=>{
  try{
    const uname = req.body.username
    const user = await Users.findOne({username:uname});
    if(user){
      res.json(user);
    }
    else{
      const newUser = new Users({username:uname});
      await newUser.save();
      res.json(newUser)
    }
  }
  catch(e){
    console.error('Error Saving new user in db',e);
    res.status(500).json({error: 'Failed to save new user'});
  }
});

//fetch all users
app.get('/api/users',async (req,res)=>{
  try{
  const UserList = await Users.find()
  res.json(UserList);
  }
  catch(e){
    console.error('Error fetching users',e);
    res.status(500).json({error: "Failed to fetch users list"});
  }
});

//add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const uid = req.params["_id"];
    const { description, duration, date } = req.body;
    
    const exercise =  {
      _id: uid,
      description: description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
    };

    const exerciseDoc = new Exercise(exercise);
    await exerciseDoc.save()

    res.json(exerciseDoc);
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Failed to add Exercise' });
  }
});


//fetch logs for a user
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const uid = req.params["_id"];
    let { from, to, limit } = req.query;

    // Convert limit to a number, default to 0 if not provided
    limit = limit ? parseInt(limit) : 0;

    // Prepare query conditions
    const conditions = { _id: uid };
    if (from || to) {
      conditions.date = {};
      if (from) conditions.date.$gte = new Date(from);
      if (to) conditions.date.$lte = new Date(to);
    }

    // Fetch user and populate exercise logs
    const user = await Users.findById(uid);
    const logs = await Exercise.find(conditions)
                              .limit(limit)
                              .select('description duration date -_id');

    // Construct response object
    const response = {
      _id: user._id,
      username: user.username,
      count: logs.length,
      log: logs.map(log => ({
        description: log.description,
        duration: log.duration,
        date: log.date.toDateString() // Convert date to string
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ error: 'Failed to fetch user logs' });
  }
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
