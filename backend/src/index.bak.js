import http from "http"
import express from "express"
import mongoose from "mongoose"
import WebSocket from "ws"
import mongo from './mongo'
import wsConnect from './wsConnect'
import { v4 as uuidv4 } from 'uuid'

mongo.connect();

const app = express()
const server = http.createServer(app)
// console.log(server);
const wss = new WebSocket.Server({ server })
const db = mongoose.connection

db.once('open', () => {
    console.log("MongoDB connected!");
    wss.on('connection', (ws) => {
        // Define WebSocket connection logic
        // ...
        ws.id = uuidv4();
        ws.box = '';
        // wsConnect.initData(ws);
        // wsConnect.onMessage(ws);
        // ws.onmessage = wsConnect.onMessage(wss, ws);
        ws.onmessage = wsConnect.onMessage(wss, ws);
    });
});

const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => { ... });
server.listen(PORT, () =>
    console.log(`Example app listening on port ${PORT}!`)
);