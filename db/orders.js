const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "logins",
  },
  username : {
    type:String
  },
  orderId: {
    type: String,
  },
  date: {
    type: String,
  },
  amount:{
    type:Number
  },
  cart: [],
  status: {
    type: Boolean,
  },
});
module.exports = mongoose.model("Orders", OrderSchema);
