const { verify } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const Login = require("../db/login");


const authUser = async (req, res, next) => {
  try {
    // if(!req.header('Authorization')){
    //   res.send({message:"login  First"})
    // }
    const token = req.header("Authorization");
    const verifyUser = verify(token, process.env.TOKEN);
    const user = await Login.findOne({ _id: verifyUser._id });
    if (user == null) {
      res.status(401);
      return res.send({ message: "login first" });
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(403).send({ message: "login First" });
  }
};

function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      res.status(401);
      return res.send({ message: "Not Allowed" });
    }
    next();
  };
}

module.exports = { authUser, authRole };
