const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "logins",
  },
  username : {
    type:String
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: [
    {
      image1: {
        type: String,
        required: true,
      },
      image2: {
        type: String,
        required: true,
      },
      image3: {
        type: String,
        required: true,
      },
    },
  ],
  details: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("Products", productSchema);
