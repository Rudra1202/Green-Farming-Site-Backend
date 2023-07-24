const express = require("express");
const { authUser } = require("../middleware/loginAuth");
const {
  canViewProduct,
  scopedProducts,
  setcart,
} = require("../middleware/productsAuth");
const Products = require("../db/product");
const Logins = require("../db/login");
const Payments = require("../db/payment");
const Carts = require("../db/cart");
const router = express.Router();
const Orders = require("../db/orders.js");

router.get("/", authUser, async (req, res) => {
  try {
    const users = await Logins.find({});
    const products = await Products.find({});
    const payments = await Payments.find({});
    res.status(201).send({ users, products, payments, message: "success" });
  } catch (error) {
    console.log(error);
  }
});

router.get("/users", authUser, async (req, res) => {
  try {
    const users = await Logins.find({});
    res.status(201).send({ users, message: "success" });
  } catch (error) {
    console.log(error);
  }
});
router.get("/products", authUser, async (req, res) => {
  try {
    const products = await Products.find({});
    res.status(201).send({ products, message: "success" });
  } catch (error) {
    console.log(error);
  }
});
router.get("/payments", authUser, async (req, res) => {
  try {
    const payments = await Payments.find({});
    res.status(201).send({ payments, message: "success" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
