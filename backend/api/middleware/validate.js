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
  console.log('validateAdmin');

  
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log('token', token);

  console.log('process.env.JWT_KEY', process.env.JWT_KEY);

  console.log('authHeader', authHeader);
  

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

const verifyToken = (req, res, next) => {
  // Try to get token from Authorization header first
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If no token in header, try cookies
  if (!token) {
    const cookieToken = req.cookies.accessToken;
    if (!cookieToken) {
      return res.status(401).json({ message: "You are not authenticated!" });
    }
    req.token = cookieToken;
  } else {
    req.token = token;
  }

  try {
    const decoded = jwt.verify(req.token, process.env.JWT_KEY);
    req.userId = decoded.id;
    req.isSeller = decoded.isSeller;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token is not valid!" });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "You are not authorized as an admin!" });
    }
    next();
  });
};

const verifySeller = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.isSeller) {
      return res.status(403).json({ message: "You are not authorized as a seller!" });
    }
    next();
  });
};

export { verifyToken, verifyAdmin, verifySeller };

export { validate, validateAdmin };
