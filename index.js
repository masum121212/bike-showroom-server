const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

// // port
const port = process.env.PORT || 5000;


// // middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jjyn9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });






async function run() {
    try {
        await client.connect();

        console.log('database connected successfully');



        const database = client.db('bike_house');
        const productCollection = database.collection('products');
        const purchaseCollection = database.collection('purchases');
        const userCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');

        // get products
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // post add product 
        app.post('/products', async (req, res) => {
            console.log(req.body);
            const result = await productCollection.insertOne(req.body);
            res.send(result);
        })

        // post order 
        app.post('/purchases', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result);
        })

        // get order 
        app.get('/purchases', async (req, res) => {
            const cursor = purchaseCollection.find({});
            const purchase = await cursor.toArray();
            console.log(purchase);
            res.send(purchase);
        })

        // email varification
        app.get('/purchases/:email', async (req, res) => {
            const email = req.params.email;
            const result = await purchaseCollection.find({ email }).toArray();
            res.json(result);
        })

        // get order details
        app.put('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const manage = {
                $set: {
                    status: 'Confirm'
                }
            }
            const result = await purchaseCollection.updateOne(query, manage)
            res.json(result)
        })

        // post Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result)
            res.json(result)
        });


        // get Admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // update admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user)
            const filter = { email: user?.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        //get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({})
            const review = await cursor.toArray()
            res.json(review)
        })

        // post a review
        app.post("/reviews", async (req, res) => {
            const cursor = req.body;
            const review = await reviewCollection.insertOne(cursor);
            res.send(review);
        });

        // delet orders
        app.delete('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        })

        // delet Products 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hero Motors Portal!!')
})

app.listen(port, () => {
    console.log(`Running at ${port}`)
})