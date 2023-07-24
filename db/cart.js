const mongoose  = require("mongoose");
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "logins",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  }
});
module.exports = mongoose.model("Carts", cartSchema);
