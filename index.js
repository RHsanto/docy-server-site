const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avm9c.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Docy");
    const blogCollection = database.collection("blogs");
    const usersColletion = database.collection("users");

    // for posting blogs
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      console.log(result);
      res.json(result);
    });

    // for getting all blog
    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection.find({});
      const blogs = await cursor.toArray();
      res.json(blogs);
    });

    // for single blog
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const query = { _id: ObjectId(id) };
      const service = await blogCollection.findOne(query);
      res.json(service);
    });

    // for updateing the blog || adding comment
    // app.put("/blog", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateDocs = { $set: req.body };
    //   const result = await usersColletion.updateOne(query, updateDocs, options);
    // });

    // user post api
    app.post("/users", async (req, res) => {
      const cursor = await usersColletion.insertOne(req.body);
      res.json(cursor);
    });

    // users put api
    app.put("/users", async (req, res) => {
      const query = { email: req.body.email };
      const options = { upsert: true };
      const updateDocs = { $set: req.body };
      const result = await usersColletion.updateOne(query, updateDocs, options);
    });

    // All user information
    // app.get("/users", async (req, res) => {
    //   const cursor = usersColletion.find({});
    //   const users = await cursor.toArray();
    //   res.json(users);
    // });
    app.get("/users", async (req, res) => {
      const user = usersColletion.find({});
      const result = await user.toArray();
      res.send(result);
    });

    // users information by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersColletion.findOne(query);
      // let isAdmin = false;
      // if (user?.role === "admin") {
      //   isAdmin = true;
      // }
      res.json(user);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Programming Folks!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
