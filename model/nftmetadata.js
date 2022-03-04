const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NFTMetadataSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  token_id: {
    type: String,
    required: true,
  }
})

module.exports = NFTMetadata = mongoose.model("nftmetadata", NFTMetadataSchema, "nftmetadata");
