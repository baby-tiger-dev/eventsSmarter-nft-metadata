const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
  },
  logo_img: {
    type: String,
  },
  wallet_address: {
    type: String,
    required: true,
  },
})

module.exports = User = mongoose.model("user", UserSchema, "user");
