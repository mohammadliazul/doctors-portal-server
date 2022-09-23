const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hta0c.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        // console.log('Database connected successfully');
        const database = client.db('doctors_portal');
        const appointmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');

      app.post('/appointments', async (req, res) => {
        const appointment = req.body;
        const result = await appointmentsCollection.insertOne(appointment);
        res.json(result);
      });

      app.get('/appointments', async(req, res)=>{
        const email = req.query.email;
        const date = req.query.date;
        const query = {email: email, date: date}
        const cursor = appointmentsCollection.find(query);
        const appointments = await cursor.toArray();
        res.json(appointments);
      });

      app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      });

      app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      });

      app.put('/users/make-admin', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email}
          const updateDoc = { $set: {role: 'admin'} };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
      });

      app.get('/users/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin: isAdmin});
      });

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Doctors Portal!');
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})