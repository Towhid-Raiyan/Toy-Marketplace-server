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

const dbConnect = async() =>{
  try{
    client.connect();
    console.log("Database connected successfully");
  }
  catch(error){
    console.log(error.name, error.message);
  }
}
dbConnect();

// async function run() {
  // try{
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('ToyMarketplace').collection('Toys');

    // get toys
    app.get('/toys', async (req, res) => {
      let query = {};
      if (req.query.name) {
        query = { name: req.query.name };
      }
      const cursor = toysCollection.find(query).limit(20);
      const toys = await cursor.toArray();
      res.send(toys);
    })
    
    // get toys on tab (categorical data load)
    app.get("/toys/:subcategory", async (req, res) => {
      const subcategory = req.params.subcategory;
      console.log(subcategory);
      query = { subcategory: subcategory };
      const cursor = toysCollection.find(query).limit(3); //displaying 3  product on home page
      const toys = await cursor.toArray();
      
      res.send(toys);
    });
 
    // mytoys
    app.get("/mytoys", async (req, res) => {
      const query = { SellerEmail: req.query.email };
      const sortType = req.query.sort;
      console.log(sortType);
      if (sortType == "asc") {
          const cursor = await toysCollection
              .find(query)
              .sort({ price: 1 }) //for ascending order
              .toArray();
          return res.send(cursor);
      } else if (sortType == "desc") {
          const cursor = await toysCollection
              .find(query)
              .sort({ price: -1 }) //for descending order
              .toArray();
          return res.send(cursor);
      } else {
          const cursor = await toysCollection.find(query).toArray();
          return res.send(cursor);
      }
  });

    // delete my toy
    app.delete("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // get a toy
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });
    // edit a toy
    app.put("/edittoy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const {
        picture,
        name,
        SellerName,
        SellerEmail,
        price,
        quantity,
        rating,
        description,
        subcategory,
      } = req.body;
      const updateDoc = {
        $set: {
        picture,
        name,
        SellerName,
        SellerEmail,
        price,
        quantity,
        rating,
        description,
        subcategory,
        },
      };
      console.log("hitted ", id);
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // add a toy
    app.post("/addtoy", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toysCollection.insertOne(toy);
      res.send(result);
  });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  // } finally {
  //   // Ensures that the client will close when you finish/error
  //   // await client.close();
  // }
// }
// run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Toy Marketplace is Running...');
})

app.listen(port, () => {
  console.log(`Toy market place is Running on port : ${port}`);
})