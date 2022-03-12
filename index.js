const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8000;

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

    // users when the first time register put api
    app.put("/users", async (req, res) => {
      const query = { email: req.body.email };
      const options = { upsert: true };
      const updateDocs = { $set: req.body };

      // getting user info if already have in the db
      const userInfo = await usersColletion.findOne(query);
      if (userInfo) {
        res.send("already in the db ");
      } else {
        const result = await usersColletion.updateOne(
          query,
          updateDocs,
          options
        );
      }
    });

    // user pofile update api here
    app.put("/profile-update", async (req, res) => {
      const query = { email: req.body.email };
      const options = { upsert: true };
      const updateDocs = { $set: req.body };
      const result = await usersColletion.updateOne(query, updateDocs, options);
      res.json(result);
      console.log(result);
    });

    // users follow and following api start here
    app.put("/user", async (req, res) => {
      const bloggerId = req.body.bloggerId;
      const userId = req.body.userId;
      const options = { upsert: true };

      // getting blogger info here
      const blogger = await usersColletion.findOne({
        _id: ObjectId(bloggerId),
      });
      const bloggerPayload = {
        id: blogger?._id,
        email: blogger?.email,
        name: blogger?.displayName,
        image: blogger?.image,
      };
      // getting user info here
      const user = await usersColletion.findOne({ _id: ObjectId(userId) });
      const userPayload = {
        id: user?._id,
        email: user?.email,
        name: user?.displayName,
        image: user?.image,
      };

      // update blogger here
      const bloggerDocs = {
        $push: { followers: userPayload },
      };
      // update user here
      const userDocs = {
        $push: { following: bloggerPayload },
      };

      const updateBlogger = await usersColletion.updateOne(
        blogger,
        bloggerDocs,
        options
      );
      const updateUser = await usersColletion.updateOne(
        user,
        userDocs,
        options
      );
      res.send("followers followwing updated");
    });
    // and user followw and following api end here

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




    app.get("/emails/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const user = await emailsColletion.findOne(query);
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
