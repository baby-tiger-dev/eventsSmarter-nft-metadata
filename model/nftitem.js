const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NFTItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  token_id: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  collections: {
    type: String,
    required: true,
  },
  selling: {
    type: Boolean,
    required: true,
  },
  royalty: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  selling_count: {
    type: Number,
    required: true,
  },
  favourite_count: {
    type: Number,
    required: true,
  },
  selling_time: {
    type: Date,
  },
  view_count: {
    type: Number,
    required: true,
  }
})

module.exports = NFTItem = mongoose.model("nftitem", NFTItemSchema, "nftitem");
