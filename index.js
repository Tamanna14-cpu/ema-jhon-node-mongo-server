const express = require('express')
var cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;



// middleware
app.use(cors())
app.use(express.json());


app.get('/', (req, res) => {
    res.send('ema jhon is running')
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y9cyf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("online_shop");
        const productsCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});

            // query parameter(for pagination)
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();

            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send({ count, products })
        });


        // POST API to get data by keys
        app.post('/products/bykeys', async (req, res) => {
            const keys = req.body;
            // console.log("hit the post api");
            const query = { key: { $in: keys } }
            const products = await productsCollection.find(query).toArray();
            console.log(products);
            res.json(products)
        })


        // add order api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log("hit the post api");
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);