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

// mongo url and client //
// mongo url and client //
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avm9c.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // databases here
    await client.connect();
    const database = client.db("Docy");
    const blogCollection = database.collection("blogs");
    const usersColletion = database.collection("users");
    const emailsColletion = database.collection("emails");
    const manageUserCollection = database.collection("manage-users");

    // for posting blogs
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      console.log(result);
      res.json(result);
    });

    // for getting all blog //
    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection.find({});
      const blogs = await cursor.toArray();
      res.json(blogs);
    });

    // for single blog
    app.get("/blog/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const cursor = await blogCollection.findOne(query);
      res.json(cursor);
    });

    // for updateing the blog || adding comment
    app.put("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDocs = {
        $push: { comment: req.body },
      };
      const result = await blogCollection.updateOne(query, updateDocs, options);
      console;
    });

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

    // blog delete api
    app.delete("/blog/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const result = await blogCollection.deleteOne(query);
      res.json(result);
    });


    // send email to admin
      app.post("/emails", async (req, res) => {
        const data = await emailsColletion.insertOne(req.body);
        res.json(data);
      });

    //  get users emails
        app.get("/emails", async (req, res) => {
          const data = emailsColletion.find({});
          const emails = await data.toArray();
          res.json(emails);
        });

    //  get single users emails
        app.get("/emails/:id", async (req, res) => {
          const query = { _id: ObjectId(req.params.id) };
          const user = await emailsColletion.findOne(query);
          res.json(user);
        });

   //get all manage user info 
   app.get("/manage-users", async (req,res)=>{
    const data = manageUserCollection.find({});
    const mangeUser = await data.toArray();
    res.json(mangeUser);
   })

   //  get single users emails
    app.get("/manage-users/:id", async (req, res) => {
   const query = { _id: ObjectId(req.params.id) };
   const user = await manageUserCollection.findOne(query);
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
