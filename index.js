const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

// middleware
const verify = (req, res, next) => {
  next();
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("jwt-practice");
    const userCollection = db.collection("users");

    app.get("/", (req, res) => {
      res.send("Hi this is CoDeHasib's JWT Practice backend");
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/users/:id", verify, async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      console.log(query);
      const result = await userCollection.findOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", verify, (req, res) => {
  res.send("Hello world");
});

app.listen(process.env.PORT, console.log(`${process.env.PORT} is listening`));
