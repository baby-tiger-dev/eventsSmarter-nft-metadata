const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavouriteSchema = new Schema({
  wallet_address: {
    type: String,
    required: true,
  },
  token_id: {
    type: String,
    required: true,
  }
})

module.exports = Favourite = mongoose.model("favourite", FavouriteSchema, "favourite");
