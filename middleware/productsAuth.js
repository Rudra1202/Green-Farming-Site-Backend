const Carts = require("../db/cart");

const scopedProducts = async (user, Products) => {
  if (user.role === "admin") {
    const data = await Products.find();
    if (data.length == []) {
      var s = "Product not Found";
      return s;
    }
    return data;
  } else {
    const data = await Products.find({ userId: user._id });
    if (data == null) {
      console.log("not Found");
      var s = "Product not Found";
      return s;
    }
    return data;
  }
};

const setcart = async (user) => {
  try {
    const data = await Carts.find({ userId: user._id });
    if (data === null) {
      return null;
    }
    return data;
  } catch (error) {
    return error
  }
};

const canViewProduct = (user, product) => {
  return user.role == "admin" || product.userId == user._id;
};

module.exports = {
  setcart,
  scopedProducts,
  canViewProduct,
};
