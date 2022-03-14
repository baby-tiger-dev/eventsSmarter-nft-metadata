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
const lodash = require('lodash');
const Favourite = require('./model/favourite');

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
            res.end(JSON.stringify({ "state": "error", "data": error }));
        } else {
            if (result.length) {
                res.end(JSON.stringify({ "state": "success", "data": result[0] }));
            } else {
                const user = new User({
                    "name": null,
                    "wallet_address": req.body.wallet_address,
                    "image_url": null,
                    "crypto_amount": 0,
                })
                user.save((error, result) => {
                    if (error) {
                        res.end(JSON.stringify({ "state": "error", "data": error }))
                    } else {
                        res.end(JSON.stringify({ "state": "success", "data": result }))
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
        image_url: req.body.image_url,
        category: req.body.category,
        count: 0,
    })

    collection.save((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "state": "success", "data": result }))
        }
    })
})

app.get('/category', (req, res) => {
    Category.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "state": "success", "data": result }))
        }
    })
})

app.get('/collections/:wallet_address', (req, res) => {
    Collection.find({ "owner": req.params.wallet_address }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            let users = []
            let collections = result;
            collections.map((value, index) => {
                User.find({ wallet_address: value.owner }).exec((error, result) => {
                    if (error) {
                        res.end(JSON.stringify({ "state": "error", "data": error }))
                    } else {
                        users[index] = result[0]
                        if (users.length === collections.length) {
                            res.end(JSON.stringify({ "state": "success", "data": collections, "users": users }))
                        }
                    }
                })
            })
        }
    })
})

app.get('/collections', (req, res) => {
    Collection.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            let users = []
            let collections = result;
            collections.map((value, index) => {
                User.find({ wallet_address: value.owner }).exec((error, result) => {
                    if (error) {
                        res.end(JSON.stringify({ "state": "error", "data": error }))
                    } else {
                        users[index] = result[0]
                        if (users.length === collections.length) {
                            res.end(JSON.stringify({ "state": "success", "data": collections, "users": users }))
                        }
                    }
                })
            })
        }
    })
})

app.get('/user/:wallet_address', (req, res) => {
    User.find({ "wallet_address": req.params.wallet_address }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "state": "success", "data": result[0] }))
        }
    })
})

app.get('/assets/:wallet_address', (req, res) => {
    let items = []
    let users = []
    NFTItem.find({ "owner": req.params.wallet_address }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            items = result;
            items.map((value, index) => {
                User.find({ "wallet_address": value.creator }).exec((error, result) => {
                    if (error) {
                        res.end(JSON.stringify({ "state": "error", "data": error }))
                    } else {
                        users[index] = result[0];
                        if (users.length === items.length) {
                            res.end(JSON.stringify({ "state": "success", "data": items, "users": users }))
                        }
                    }
                })
            })
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
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            const nftitem = new NFTItem({
                name: req.body.name,
                description: req.body.description,
                image_url: req.body.image_url,
                token_id: req.body.token_id,
                collections: req.body.collection,
                owner: req.body.owner,
                creator: req.body.creator,
                royalty: req.body.royalty,
                selling: false,
                price: 0.0,
                type: "ETH",
                selling_count: 0,
                favourite_count: 0,
                view_count: 0,
            })
            nftitem.save((error, result) => {
                if (error) {
                    res.end(JSON.stringify({ "state": "error", "data": error }))
                } else {
                    const item = result;
                    Collection.find({ "name": req.body.collection }).exec((error, result) => {
                        if (error) {
                            res.end(JSON.stringify({ "state": "error", "data": error }))
                        } else {
                            Collection.findOneAndUpdate({ "name": req.body.collection }, { "count": result[0].count + 1 }, (error, result) => {
                                if (error) {
                                    res.end(JSON.stringify({ "state": "error", "data": error }))
                                } else {
                                    res.end(JSON.stringify({ "state": "success", "data": item, "collection": result }))
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

app.get('/asset/:token_id', (req, res) => {
    NFTMetadata.find({ "token_id": req.params.token_id }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify(result[0]))
        }
    })
})

app.get('/collection/is-available/:collection_name', (req, res) => {
    Collection.find({ "name": req.params.collection_name }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            if (result.length) {
                res.end(JSON.stringify({ "state": "error", "data": error }))
            } else {
                res.end(JSON.stringify({ "state": "success", "data": result }))
            }
        }
    })
})

app.get('/assets', (req, res) => {
    NFTItem.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "state": "success", "data": result }))
        }
    })
})

app.get('/collection/:collection_name', (req, res) => {
    let nftItem;
    let collection;
    Collection.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            collection = lodash.filter(result, (item) => { return item.name.toLowerCase() === req.params.collection_name.toLowerCase() });
            NFTItem.find().exec((error, result) => {
                if (error) {
                    res.end(JSON.stringify({ "state": "error", "data": error }))
                } else {
                    nftItem = lodash.filter(result, (item) => { return item.collections.toLowerCase() === req.params.collection_name })
                    User.find({ "wallet_address": collection[0]?.owner }).exec((error, result) => {
                        if (error) {
                            res.end(JSON.stringify({ "state": "error", "data": error }))
                        } else {
                            res.end(JSON.stringify({ "state": "success", "data": nftItem, "collection": collection[0], "user": result[0] }))
                        }
                    })
                }
            })
        }
    })
})

app.get('/asset/:collection_name/:nft_name', (req, res) => {
    let nftItem;
    let collection;
    let owner;
    Collection.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            collection = lodash.filter(result, (item) => { return item.name.toLowerCase() === req.params.collection_name.toLowerCase() });
            NFTItem.find({ "collections": collection[0].name }).exec((error, result) => {
                if (error) {
                    res.end(JSON.stringify({ "state": "error", "data": error }))
                } else {
                    nftItem = lodash.filter(result, (item) => { return item.name.toLowerCase() === req.params.nft_name.toLowerCase() })
                    User.find({ "wallet_address": nftItem[0].owner }).exec((error, result) => {
                        if (error) {
                            res.end(JSON.stringify({ "state": "error", "data": error }))
                        } else {
                            owner = result[0];
                            User.find({ "wallet_address": nftItem[0].creator }).exec((error, result) => {
                                if (error) {
                                    res.end(JSON.stringify({ "state": "error", "data": error }))
                                } else {
                                    res.end(JSON.stringify({ "state": "success", "data": nftItem[0], "collection": collection[0], "owner": owner, "creator": result[0] }))
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

app.get('/find/topItem', (req, res) => {
    NFTItem.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            let top = { selling_count: -1 };
            for (let i = 0; i < result.length; i++) {
                if (top.selling_count < result[i].selling_count) {
                    top = result[i];
                }
            }
            res.end(JSON.stringify({ "state": "success", "data": top }))
        }
    })
})

app.get('/find/topSeller', (req, res) => {
    User.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            const data = lodash.orderBy(result, ['crypto_amount'], ['desc'])
            const sending = lodash.slice(data, 0, data.length > 10 ? 10 : data.length);
            res.end(JSON.stringify({ "state": "success", "data": sending }))
        }
    })
})

app.put('/asset/:collection_name/:nft_name/selling', (req, res) => {
    let nftItem;
    let collection;
    let owner;
    Collection.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            collection = lodash.filter(result, (item) => { return item.name.toLowerCase() === req.params.collection_name });
            NFTItem.find({ "collections": collection[0].name }).exec((error, result) => {
                if (error) {
                    res.end(JSON.stringify({ "state": "error", "data": error }))
                } else {
                    nftItem = lodash.filter(result, (item) => { return item.name.toLowerCase() === req.params.nft_name })
                    owner = nftItem[0].owner;
                    nftItem[0].selling = req.body.selling;
                    nftItem[0].price = req.body.price;
                    nftItem[0].owner = req.body.owner;
                    nftItem[0].selling_time = new Date();
                    nftItem[0].save((error, result) => {
                        if (error) {
                            res.end(JSON.stringify({ "state": "error", "data": error }))
                        } else {
                            if (req.body.type === "buy") {
                                User.find({ wallet_address: owner }).exec((error, result) => {
                                    if (error) {
                                        res.end(JSON.stringify({ "state": "error", "data": error }))
                                    } else {
                                        result[0].crypto_amount += parseFloat(req.body.price)
                                        result[0].save((error, result) => {
                                            if (error) {
                                                res.end(JSON.stringify({ "state": "error", "data": error }))
                                            } else {
                                                res.end(JSON.stringify({ "state": "success", "data": result }))
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    })
})

app.post('/history', (req, res) => {
    let history_data = [];
    req.body.data.map((value, index) => {
        User.find({ "wallet_address": value.user }).exec((error, result) => {
            if (error) {
                res.end(JSON.stringify({ "state": "error", "data": error }))
            } else {
                history_data.push({ ...value, "owner_name": result[0]?.name, "image_url": result[0]?.image_url })
                if (history_data.length === req.body.data.length) {
                    res.end(JSON.stringify({ "state": "success", "data": history_data }))
                }
            }
        })
    })
})

app.post('/favourite/add', (req, res) => {
    const fav = new Favourite({
        wallet_address: req.body.wallet_address,
        token_id: req.body.token_id,
    })

    fav.save((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            NFTItem.find({ "token_id": req.body.token_id }).exec((error, result) => {
                if (error) {
                    res.end(JSON.stringify({ "state": "error", "data": error }))
                } else {
                    NFTItem.findOneAndUpdate({ "token_id": req.body.token_id }, { "favourite_count": result[0].favourite_count + 1 }, (error, result) => {
                        if (error) {
                            res.end(JSON.stringify({ "state": "error", "data": error }))
                        } else {
                            res.end(JSON.stringify({ "state": "success", "data": result.favourite_count + 1 }))
                        }
                    })
                }
            })
        }
    })
})

app.post('/favourite/remove', (req, res) => {
    Favourite.deleteOne({ wallet_address: req.body.wallet_address, token_id: req.body.token_id }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            NFTItem.find({ "token_id": req.body.token_id }).exec((error, result) => {
                if (error) {
                    res.end(JSON.stringify({ "state": "error", "data": error }))
                } else {
                    NFTItem.findOneAndUpdate({ "token_id": req.body.token_id }, { "favourite_count": result[0].favourite_count - 1 }, (error, result) => {
                        if (error) {
                            res.end(JSON.stringify({ "state": "error", "data": error }))
                        } else {
                            res.end(JSON.stringify({ "state": "success", "data": result.favourite_count - 1 }))
                        }
                    })
                }
            })
        }
    })
})

app.get('/favourite/:wallet_address', (req, res) => {
    Favourite.find({ wallet_address: req.params.wallet_address }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "state": "success", "data": result }))
        }
    })
})

app.get('/favourite/:wallet_address/:token_id', (req, res) => {
    Favourite.find({ wallet_address: req.params.wallet_address, token_id: req.params.token_id }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "state": "success", "data": result }))
        }
    })
})

app.get('/find/todayPicks', (req, res) => {
    NFTItem.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            const today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);
            const data = result.filter((value) => value.selling_time >= today && value.selling)
            let users = [];
            data.map((value, index) => {
                User.find({ wallet_address: value.owner }).exec((error, result) => {
                    if (error) {
                        res.end(JSON.stringify({ "state": "error", "data": error }))
                    } else {
                        users[index] = result[0];
                        if (users.length === data.length) {
                            res.end(JSON.stringify({ "state": "success", "data": data, "users": users }))
                        }
                    }
                })
            })
        }
    })
})

app.get('/find/topCollection', (req, res) => {
    Collection.find().exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            const data = result.slice(0, result.length > 3 ? 3 : result.length);
            let user = [];
            let count = 0;
            data.map((value, index) => {
                User.find({ wallet_address: value.owner }).exec((error, result) => {
                    if (error) {
                        res.end(JSON.stringify({ "state": "error", "data": error }))
                    } else {
                        user[index] = result[0];
                        count++;
                        if (data.length === count) {
                            res.end(JSON.stringify({ "state": "success", "data": data, "users": user }))
                        }
                    }
                })
            })
        }
    })
})

app.post('/user/:wallet_address/update', (req, res) => {
    User.findOneAndUpdate({ wallet_address: req.params.wallet_address }, { name: req.body.name, email: req.body.email, image_url: req.body.image_url }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "state": "success", "data": result }))
        }
    })
})

app.put('/user/:wallet_address/addAmount', (req, res) => {
    User.find({ wallet_address: req.params.wallet_address }).exec((error, result) => {
        if (error) {
            res.end(JSON.stringify({ "state": "error", "data": error }))
        } else {
            res.end(JSON.stringify({ "state": "success", "data": result }))
        }
    })
})

app.get('/user/:wallet_address/favourite', (req, res) => {
    let favourite_data = [];
    let users = [];
    let items = [];
    Favourite.find({ wallet_address: req.params.wallet_address }).exec((error, result) => {
        favourite_data = result;
        favourite_data.map((value, index) => {
            NFTItem.find({ "token_id": value.token_id }).exec((error, result) => {
                if (error) {
                    res.end(JSON.stringify({ "state": "error", "data": error }))
                } else {
                    items[index] = result[0];
                    User.find({ "wallet_address": result[0].creator }).exec((error, result) => {
                        if (error) {
                            res.end(JSON.stringify({ "state": "error", "data": error }))
                        } else {
                            users[index] = result[0];
                            if (items.length === favourite_data.length) {
                                res.end(JSON.stringify({ "state": "success", "data": items, "users": users }))
                            }
                        }
                    })
                }
            })
        })
    })
})

app.listen(port);
