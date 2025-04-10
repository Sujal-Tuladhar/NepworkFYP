import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const validate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).send("Unauthorized");
  jwt.verify(token, process.env.JWT_KEY, async (err, user) => {
    if (err) return res.status(401).send("Unauthorized");

    user = user._id;
    // console.log(user);

    const userData = await User.findById(user).lean();

    if (!userData) {
      return res.status(401).send("Unauthorized");
    }

    req.user = userData;
    req.isSeller = userData.isSeller;
    next();
  });
};

const validateAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).send("Unauthorized");

  jwt.verify(token, process.env.JWT_KEY, async (err, user) => {
    if (err) return res.status(401).send("Unauthorized");
    const userData = await User.findOne({ _id: user }).lean();
    if (!userData || userData.type !== "admin") {
      return res.status(401).send("Unauthorized");
    }

    req.user = userData;
    next();
  });
};

export { validate, validateAdmin };
