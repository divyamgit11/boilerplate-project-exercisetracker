//index.js
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Users = require(__dirname + '/models/users');

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
  const UserList = await Users.find().select({count:0, log:0}).exec();
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
    
    const exercise = {
      description: description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
      date: date ? new Date(date).toDateString() : new Date().toDateString()
    };

    const user = await Users.findByIdAndUpdate(
      uid,
      { $push: { log: exercise } },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Failed to add Exercise' });
  }
});


//fetch logs for an user
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const uid = req.params["_id"];
    const { from, to, limit } = req.query;

    let query = { _id: uid };

    if (from || to) {
      query["log.date"] = {};
      if (from) query["log.date"].$gte = new Date(from);
      if (to) query["log.date"].$lte = new Date(to);
    }

    let user = await Users.findById(uid, { log: { $slice: parseInt(limit) } }).lean();

    user.count = user.log.length;

    res.json(user);
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ error: 'Failed to fetch user logs' });
  }
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
