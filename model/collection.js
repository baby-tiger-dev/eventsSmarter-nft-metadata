const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CollectionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    owner: {
        type: String,
        required: true,
    },
    logo_img: {
        type: String,
        required: true,
    },
    royalty: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    }
})

module.exports = Collection = mongoose.model("collection", CollectionSchema, "collection");
