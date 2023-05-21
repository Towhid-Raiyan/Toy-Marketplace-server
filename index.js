const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//Middleware

app.use(cors());
app.use(express.json());

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Origin",
    "X-Requested-With",
    "Accept",
    "x-client-key",
    "x-client-token",
    "x-client-secret",
    "Authorization",
  ],
  credentials: true,
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cq8nopc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db('ToyMarketplace').collection('Toys');

    // get toys
    app.get('/toys', async (req, res) => {
      let query = {};
      if (req.query.name) {
        query = { ToyName: req.query.name };
      }
      const cursor = toysCollection.find(query).limit(20);
      const toys = await cursor.toArray();
      res.send(toys);
    })

    // get toys on tab (categorical data load)
    app.get("/toys/:category", async (req, res) => {
      const category = req.params.category;
      console.log(category);
      query = { Category: category };
      const cursor = toysCollection.find(query).limit(6); //don't need to display all product on home page
      const toys = await cursor.toArray();
      res.send(toys);
  });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Toy Marketplace is running');
})

app.listen(port, () => {
  console.log(`Toy market place is running on port : ${port}`);
})