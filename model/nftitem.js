const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NFTItemSchema = new Schema({
  token_id: {
    type: String,
    required: true,
  },
  collections: {
    type: String,
    required: true,
  }
})

module.exports = NFTItem = mongoose.model("nftitem", NFTItemSchema, "nftitem");
