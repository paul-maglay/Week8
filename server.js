//Create Express.js instance
var express = require("express")
const app = express()

//configuring Express.js

app.use(express.json())
app.set('port',3000)
app.use((req,res,next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
});

//Connecting to MongoDB
const MongoClient = require('mongodb').MongoClient;

let db;
//inside the connect code is the connection string of your server
MongoClient.connect('mongodb+srv://paulmaglay:twHfEqpFFJTKkJxu@cluster0.1wurb.mongodb.net', (err,client) =>{
    db = client.db('Webstore')
})
//display message for root path to show that API is working
app.get('/',(req,res,next)=>{
    res.send("Select a collection, e.g., /collection/messages")
})

//getting the collection name
app.param("collectionName", (req,res,next,collectionName) =>{
    req.collection = db.collection(collectionName)
    // console.log('collection name:', req.collection)
    return next()
})

//retrieve all objects from collection
app.get('/collection/:collectionName',(req,res,next)=>{
    req.collection.find({}).toArray((e,results) =>{
        if (e) return next(e)
            res.send(results)
    })
})
app.post('/collection/:collectionName',(req,res,next)=>{
    req.collection.insert(req.body,(e,results)=>{
        if(e) return next(e)
            res.send(results.ops)
    })
})
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id'
    ,(req,res,next)=>{
        req.collection.findOne({_id: new ObjectID(req.params.id)},(e,result) =>{
            if(e) return next (e)
                res.send(result)
        })
    }
)
app.put('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.update(
        {_id: new ObjectID(req.params.id)},
        {$set:req.body},
        {safe: true, multi:false},
        (e, result) =>{
            res.send((result.result.n === 1) ? {msg:'success'} : {msg:'error'})
        }
    )
})

app.delete('/collection/:collectionName/:id',(req,res,next) =>{
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id)},(e,result)=>{
            if(e) return next(e)
                res.send((result.result.n ===1 )?
            {msg: 'success'}:{msg:'error'})
        }
    )
})
/**app.listen(3000, () =>{
    console.log('Express.js server running at localhost:3000')

}) **/

const port = process.env.PORT || 3000
app.listen(port)
