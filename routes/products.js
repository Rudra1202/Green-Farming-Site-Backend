const express = require("express");
const { authUser } = require("../middleware/loginAuth");
const {
  canViewProduct,
  scopedProducts,
  setcart,
} = require("../middleware/productsAuth");
const Products = require("../db/product");
const Payments = require("../db/payment");
const Carts = require("../db/cart");
const Orders = require("../db/orders.js");
const router = express.Router();
const path = require("path");

const __variableOfChoice = path.resolve();
router.use(
  "/uploads",
  express.static(path.join(__variableOfChoice, "./uploads"))
);

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", authUser, async (req, res) => {
  const data = await Products.find();
  res.send({ data, message: "success" });
});

router.get("/myproducts", authUser, async (req, res) => {
  var data = await scopedProducts(req.user, Products);
  res.send({ data, message: "success" });
});

router.post(
  "/add",
  authUser,
  upload.fields([
    { name: "file1", maxCount: 1 },
    { name: "file2", maxCount: 1 },
    { name: "file3", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const file = req.files;
      const user = new Products({
        userId: req.user._id,
        username:req.user.username,
        name: req.body.name,
        details: req.body.details,
        price: req.body.price,
        stock: req.body.stock,
        images: [
          {
            image1: file.file1[0].path,
            image2: file.file2[0].path,
            image3: file.file3[0].path,
          },
        ],
      });
      const createUser = await user.save();
      res.status(201).send({ message: "success" });
    } catch (e) {
      res.status(400).send({ message: "Something-went-wrong!!!" });
    }
  }
);

router.get("/:id", authUser, async (req, res) => {
  try {
    const data = await Products.findById(req.params.id);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

router.patch(
  "/update/:id",
  authUser,
  upload.fields([
    { name: "file1", maxCount: 1 },
    { name: "file2", maxCount: 1 },
    { name: "file3", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const file = req.files;
      const user = await Products.findByIdAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            name: req.body.name,
            details: req.body.details,
            price: req.body.price,
            stock: req.body.stock,
            images: [
              {
                image1: file.file1[0].path,
                image2: file.file2[0].path,
                image3: file.file3[0].path,
              },
            ],
          },
        }
      );
      res.send({ message: "success" });
    } catch (e) {
      res.send(e);
    }
  }
);

router.delete("/:id", authUser, async (req, res) => {
  try {
    const del = await Products.findByIdAndDelete(req.params.id);
    res.send({ message: "delete successfully" });
  } catch (error) {
    res.send(e);
  }
});

//Details

router.get("/details/:id", authUser, async (req, res) => {
  const data = await Products.findById(req.params.id);
  res.send(data);
});

//cart

router.get("/carts/display", authUser, async (req, res) => {
  var data = await setcart(req.user);
  res.send(data);
});

router.post("/carts/add", authUser, async (req, res) => {
  const productId = req.body._id;
  const userId = req.user._id;
  const data = await Carts.findOne({ userId: userId, productId: productId });
  const product = await Products.findById(productId);
  if (product.stock == 0) {
    res.status(201).send({ message: "OutOfStock" });
  } else if (data != null) {
    res.status(201).send({ data, message: "found" });
  } else {
    try {
      const count = 1;
      const cart = new Carts({
        userId: userId,
        productId: productId,
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        image: req.body.image,
        count: count,
      });
      const createUser = await cart.save();
      res.status(201).send({ message: "success" });
    } catch (e) {
      res.status(400).send(e);
    }
  }
});

router.delete("/carts/:id", authUser, async (req, res) => {
  try {
    const del = await Carts.findByIdAndDelete(req.params.id);
    res.send({ message: "delete successfully" });
  } catch (error) {
    res.send(e);
  }
});

router.patch("/carts/count/:id", authUser, async (req, res) => {
  try {
    const user = await Carts.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          count: req.body.count,
        },
      }
    );
    res.status(201).send({ message: "success" });
  } catch (e) {
    res.send(e);
  }
});

//order

router.get("/myorder/details/list", authUser, async (req, res) => {
  try {
    const user = req.user;
    const role = req.user.role;
    if (user.role === "admin") {
      const data = await Orders.find({});
      if(data){
        res.send({ data,role, message: "Founded" });
      }
      else res.status(201).send({ message: "Not Founded" });
    } else if (user.role === "user") {
      const data = await Orders.find({ userId: user._id });
      if(data){
        res.status(201).send({ data,role, message: "Founded" });
      }
      else res.status(201).send({ message: "Not Founded" });
    }
    else res.status(201).send({ message: "Not there" });
  } catch (error) {
    res.status(403).send(error);
  }
});

router.get("/myorder/details/list/:id", authUser, async (req, res) => {
  try {
    const data = await Orders.findById(req.params.id);
    if (data) {
      if (data.status) {
        const Payment = await Payments.find({ orderId: data._id });
        res.send({ data, Payment, message: "successPayment" });
      } else {
        res.send({ data, message: "successDetails" });
      }
    } else {
      res.send({ message: "NotFound" });
    }
  } catch (error) {
    res.send(error);
  }
});

// router.get("/admin", authUser, async (req, res) => {
//   var data = await scopedProducts(req.user, Products);
//   res.json(data);
// });

// const authGetProduct = async (req, res, next) => {
//   if (!canViewProduct(req.user, req.product)) {
//     res.status(401);
//     return res.send({ message: "Not Allowed" });
//   }
//   next();
// };
// router.get("/:productId", authGetProduct, setProduct, (req, res) => {
//   console.log(req.product);
//   res.send(req.product);
// });

module.exports = router;
