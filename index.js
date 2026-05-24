const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();
app.use(express.json());
app.use(cors());

const JWKS = createRemoteJWKSet(new URL("http://localhost:3000/api/auth/jwks"));

// middleware
const verify = async (req, res, next) => {
  const token = req?.headers?.authorization;
  if (!token) {
    return res.status(401).send({ message: "unauthorized" });
  }
  const { payload } = await jwtVerify(token, JWKS);
  if (!payload) {
    return res.status(401).send({ message: "unauthorized" });
  }
  req.user = payload;
  next();
};

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
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.post("/add-users", verify, async (req, res) => {
      const ownerId = req.user.id;
      const newUser = req.body;
      const result = await userCollection.insertOne({ ...newUser, ownerId });
      res.send(result);
    });

    app.delete("/users/:id", verify, async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const deletedOne = await userCollection.deleteOne(query);
      res.send(deletedOne);
    });

    app.patch("/users/:id", verify, async (req, res) => {
      const id = req.params.id;
      const userId = req.user.id;

      const query = {
        _id: new ObjectId(id),
      };

      const existingUser = await userCollection.findOne(query);

      if (userId !== existingUser.ownerId) {
        return res.status(401).send("Not allowed");
      }

      const updatedUser = req.body;
      const result = await userCollection.updateOne(query, {
        $set: updatedUser,
      });
      console.log(result);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(process.env.PORT, console.log(`${process.env.PORT} is listening`));
