const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
  },
  image_url: {
    type: String,
  },
  email: {
    type: String,
  },
  wallet_address: {
    type: String,
    required: true,
  },
  crypto_amount: {
    type: Number,
    required: true,
  }
})

module.exports = User = mongoose.model("user", UserSchema, "user");
