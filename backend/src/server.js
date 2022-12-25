import express from 'express';
import mongoose from "mongoose"
import cors from 'cors';
import db from "../mongodb.js"
import routes from './routes/index.js';
import bodyParser from "body-parser"
import 'dotenv-defaults'

require('dotenv-defaults').config()
const app = express();
const port = process.env.PORT || 4000;
app.listen(port, () =>
 console.log(`Example app listening on port ${port}!`),
);
db.connect();
app.use(cors());
app.use('/', routes);
app.use(express.json());

// app.post("/card", (req,res)=>{
//    console.log(req.body)
//    let name ;
//    let subject;

 
// });
