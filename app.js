const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sendEmail = require("./email.js");
const { authUser, authRole } = require("./middleware/loginAuth");
const Login = require("./db/login.js");
const Payments = require("./db/payment.js");
const Products = require("./db/product.js");
const Orders = require("./db/orders.js");
const Carts = require("./db/cart.js");
const productsRouter = require("./routes/products");
const adminRouter = require("./routes/admin");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltround = 4;
const Razorpay = require("razorpay");

const bodyParser = require("body-parser");
require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.json());
app.use(cors());
app.use(cookieParser());
const port = process.env.PORT || 9000;

const url = process.env.MONGO_URL;
mongoose.connect(url, {
  useNewUrlParser: true,
});

app.get("/", (req, res) => {
  res.send({ message: "Hey, I am listening" });
});

function setData(data) {
  return (req, res, next) => {
    req.user = data;
    next();
  };
}

app.post("/login", async (req, res) => {
  try {
    const data = await Login.findOne({
      username: req.body.username,
      password: req.body.password,
    });
    if (data !== null) {
      const token = await data.generateAuthToken();
      console.log(token);
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 300000000000),
        httpOnly: true,
      });
      res.status(201).send({ token, message: "success" });
    } else {
      res.status(201).send({ message: "Not Found" });
    }
    setData(data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/user/details/",authUser,async(req,res)=>{
  try {
    const data = req.user.role;
    res.status(201).send({data,message:"success"});
  } catch (error) {
    res.send(404).send({message:"Not Found"})
  }
})
app.get("/user/details/:id",authUser,async(req,res)=>{
  try {
    const data = await Login.findById(req.params.id)
    res.status(201).send({data,message:"success"});
  } catch (error) {
    res.send(404).send({message:"Not Found"})
  }
})

  app.post("/register", async (req, res) => {
    try {
      const data = new Login({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: "user",
      });
      const token = await data.generateAuthToken();
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 300000000000),
        httpOnly: true,
      });
      const createUser = await data.save();
      res.status(201).send({ message: "success" });
    } catch (e) {
      res.status(400).send({ message: "Something-went-wrong!!!" });
    }
  });

app.post("/forget", async (req, res) => {
  try {
    const data = await Login.findOne({ email: req.body.email });
    if (data !== null) {
      let text = data.email;
      const send_to = text;
      const sent_from = process.env.MAIL_USER;
      const reply_to = text;
      const subject = "Forget PassWord";
      const message = `<b>Your password is : ${data.password}</b>`;
      await sendEmail(subject, message, send_to, sent_from, reply_to);
      res.status(201).send({ message: "success" });
    } else {
      res.status(201).send({ message: "Not Found" });
    }
  } catch (e) {
    res.status(404).send({ message: "Something-went-wrong!!!" });
  }
});

app.get("/userID",authUser,async(req,res)=>{
  try {
    res.send(req.user._id);
  } catch (error) {
    console.log(error);
  }
})

app.post("/payment",  async (req, res) => {
  try {
    const user = req.body.userID;
    // const user = req.user._id;
    const userDetails = await Login.findOne({_id:user});
    const productInCart = await Carts.find({ userId: user });
    let amount = Number(req.body.amount * 100);
    var instance = new Razorpay({
      key_id: process.env.PAYMENT_KEY_ID,
      key_secret:process.env.PAYMENT_SECRET_ID ,
    });
    const order = await instance.orders.create({
      amount: amount,
      currency: "INR",
    });
    const tarik = new Date();
    const data = new Orders({
      userId: user,
      username : userDetails.username,
      // username : req.user.username,
      orderId: order.id,
      role: userDetails.role,
      // role : req.user.role,
      amount: Number(order.amount) / 100,
      date: tarik.toLocaleDateString(),
      cart: productInCart,
      status: false,
    });
    const createData = await data.save();
    res.status(201).json({
      success: true,
      order,
      data,
    });
  } catch (error) {
    console.log(error);
  }
});
app.post("/payment/verify", async (req, res) => {
  res.send();
});

app.get("/payment/key", async (req, res) => {
  res.send(process.env.PAYMENT_KEY_ID);
});

app.post("/payment/ordered", authUser, async (req, res) => {
  const user = req.user._id;
  const productInCart = await Carts.find({ userId: user });
  productInCart.map(async (item) => {
    await Products.findOneAndUpdate(
      { _id: item.productId },
      {
        $set: {
          stock: item.stock - item.count,
        },
      }
    );
  });
  const cartDelete = await Carts.deleteMany({ userId: user });
  res.send({ message: "success" });
});

app.post("/payment/details", authUser, async (req, res) => {
  try {
    const user = req.user._id;
    const tarik = new Date();
    const data = new Payments({
      userId: user,
      orderId: req.body.orderId._id,
      referencePaymentId: req.body.razorpay_payment_id.payId,
      referenceOrderId: req.body.orderData.id,
      amount: req.body.orderData.amount / 100,
      paymentDate: tarik.toLocaleDateString(),
      status: true,
    });
    const createData = await data.save();
    const updateCount = await Orders.findOneAndUpdate(
      { _id: req.body.orderId._id },
      {
        $set: { status: true },
      }
    );
    res.send({ message: "success" });
  } catch (error) {
    res.send(error);
  }
});

app.use("/products", productsRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log("listening on : " + port);
});
