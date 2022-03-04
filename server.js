const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./model/user');
const Collection = require('./model/collection');
const Category = require('./model/category');
const NFTMetadata = require('./model/nftmetadata');
const NFTItem = require('./model/nftitem');
const app = express();

const port = process.env.PORT || 3001;
const db = "mongodb+srv://root:root@cluster0.nypxd.mongodb.net/nft-marketplace?retryWrites=true&w=majority";

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
mongoose.connect(db).then(() => console.log("MongoDB successfully connected")).catch((err) => console.log(err));

app.post('/login', (req, res) => {
    User.find({ "wallet_address": req.body.wallet_address }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }));
        } else {
            if (result.length) {
                res.end(JSON.stringify({ "msg": "success", "data": result[0] }));
            } else {
                const user = new User({
                    "name": null,
                    "wallet_address": req.body.wallet_address,
                    "logo_img": null,
                })
                user.save((error, result) => {
                    if (error) {
                        res.end(JSON.stringify({ "msg": "error", "data": error }))
                    } else {
                        res.end(JSON.stringify({ "msg": "success", "data": result }))
                    }
                })
            }
        }
    })
})

app.post('/collection/create', (req, res) => {
    const collection = new Collection({
        name: req.body.name,
        description: req.body.description,
        owner: req.body.owner,
        logo_img: req.body.logo_img,
        royalty: req.body.royalty,
        category: req.body.category,
        count: "0",
    })

    collection.save((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "msg": "success", "data": result }))
        }
    })
})

app.get('/category', (req, res) => {
    Category.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "msg": "success", "data": result }))
        }
    })
})

app.get('/collections/:wallet_address', (req, res) => {
    Collection.find({ "owner": req.params.wallet_address }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "msg": "success", "data": result }))
        }
    })
})

app.get('/collections/', (req, res) => {
    Collection.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "msg": "success", "data": result }))
        }
    })
})

app.get('/user/:wallet_address', (req, res) => {
    User.find({ "wallet_address": req.params.wallet_address }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "msg": "success", "data": result }))
        }
    })
})

app.get('/assets', (req, res) => {
    NFTItem.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "msg": "success", "data": result }))
        }
    })
})

app.post('/asset/create', (req, res) => {
    const nftmetadata = new NFTMetadata({
        name: req.body.name,
        description: req.body.description,
        image_url: req.body.image_url,
        token_id: req.body.token_id,
    })
    nftmetadata.save((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }))
        } else {
            const nftitem = new NFTItem({
                id: req.body.token_id,
                collections: req.body.collection,
            })
            nftitem.save((error, result) => {
                if (error) {
                    res.end(JSON.stringify({ "msg": "error", "data": error }))
                } else {
                    res.end(JSON.stringify({ "msg": "success", "data": result }))
                }
            })
        }
    })
})

app.get('/asset/:token_id', (req, res) => {
    NFTMetadata.find({ "token_id": req.params.token_id }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "msg": "error", "data": error }))
        } else {
            res.end(JSON.stringify(result[0]))
        }
    })
})

app.listen(port);
