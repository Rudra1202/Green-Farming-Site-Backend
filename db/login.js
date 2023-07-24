const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: [true, "Username is already present"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email is already present"],
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: { type: String, required: true },
  role:{
    type : String,
    required :true
  },
  tokens: [
    {
      token: {
        type: String,
        // required: true,
      },
    },
  ],
});


userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.TOKEN);
    this.tokens = (this.tokens|| []).concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

const login = mongoose.model("Login", userSchema);

module.exports = login;
