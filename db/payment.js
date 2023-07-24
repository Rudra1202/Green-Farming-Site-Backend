const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "logins",
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Orders",
  },
  referencePaymentId: {
    type: String,
  },
  referenceOrderId: {
    type: String,
  },
  amount: {
    type: Number,
  },
  paymentDate: {
    type: String,
  },
  status:{
    type:Boolean
  }
});
module.exports = mongoose.model("Payments", paymentSchema);
