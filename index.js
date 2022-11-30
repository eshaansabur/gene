
const express = require('express')
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT  || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//get security jwt
//require('crypto').randomBytes(64).toString('hex');
//middleware
app.use(cors());
app.use(express.json());
require('dotenv').config();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://geniusCar1:glze8g3TbBY3oEks@cluster0.z8amyl3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');
        const orderCollection = client.db('geniusCar').collection('orders');
        
        //AUTH
        app.post('/login', async (req, res) => {
            const user= req.body;
            const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN);
            //console.log({accessToken});
            res.send({accessToken});
        })
        //Get Services
        app.get('/service', async(req, res) =>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services =  await cursor.toArray();
            res.send(services);
        })

        app.get('/service/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            //console.log(query);
            const service = await serviceCollection.findOne(query);
            res.send(service);

        })

        app.post('/service', async(req, res) =>{
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);

        })

        app.delete('/service/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })

        //order collection api

        app.get('/order', async(req, res)=> {
            const authHeader = req.headers.authorization;
            console.log(authHeader);
            const email = req.query.email;
            const query = {email: email};
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })
        app.post('/order', async(req, res) =>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

    }
    finally{
        //await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
