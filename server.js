const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const firebase_app = require("firebase/app");
const firebase_storage = require("firebase/storage");
const axios = require('axios');

const firebaseConfig = {
    apiKey: "AIzaSyDJNFAaDSGnNkf-kC-8Ij2FNI6iJznisC8",
    authDomain: "test-nft-b6e86.firebaseapp.com",
    projectId: "test-nft-b6e86",
    storageBucket: "test-nft-b6e86.appspot.com",
    messagingSenderId: "937764006911",
    appId: "1:937764006911:web:96b79277857a57466c55ca"
};

firebase_app.initializeApp(firebaseConfig);

const storage = firebase_storage.getStorage();

const app = express();

const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.post('/metadata/:id', (req, res) => {
    const storageRef = firebase_storage.ref(storage, req.params.id);
    firebase_storage.uploadString(storageRef, JSON.stringify(req.body)).then((result) => {
        res.end('success');
    }).catch((error) => {
        res.end(error);
    })
})

app.get('/metadata/:id', (req, res) => {
    const storageRef = firebase_storage.ref(storage, req.params.id);
    firebase_storage.getDownloadURL(storageRef).then(data => {
        axios.get(data).then((response) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data));
        })
    })
})

app.listen(port);