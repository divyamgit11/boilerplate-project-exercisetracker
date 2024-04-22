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
app.post('/api/users/:_id/exercises',async (req,res)=>{
  try{
    const uid = req.params["_id"];
    const exercise = {
      description: req.body.desc, 
      duration: req.body.dur, 
      date: new Date(req.body.date).toDateString() || new Date().toDateString
    };
    const user = await Users.findByIdAndUpdate(
      uid,
      { $push : {log: exercise}},
      { new : true}
    );
    res.json({
      _id: uid,
      username: user.username,
      description: user.log[-1].description,
      duration: user.log[-1].duration,
      date: user.log[-1].date
    });
  }
  catch(e){
    console.error('Error adding exercise',e);
    res.status(500).json({error: 'Failed to add Exercise'});
  }
});

//fetch logs for an user
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const uid = req.params["_id"];
    const from = req.query.from;
    const to = req.query.to;
    const limit = parseInt(req.query.limit) || 0;

    let query = { _id: uid };

    if (from || to) {
      query["log.date"] = {};
      if (from) query["log.date"].$gte = new Date(from);
      if (to) query["log.date"].$lte = new Date(to);
    }

    let user = await Users.findById(uid);

    if (limit > 0 && user.log.length > limit) {
      user.log = user.log.slice(0, limit);
    }

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
