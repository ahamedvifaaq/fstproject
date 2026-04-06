import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
   let token;

   if ((req.headers.authorization && req.headers.authorization.startsWith("Bearer"))) {
      try {
         token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : req.cookies.accessToken;
         console.log("Token extracted:", token);

         const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
         req.user = await User.findById(decoded.userId).select("-password");
         return next();
      } catch (err) {
         console.error("Token verification failed:", err.message);
         
       
         return res.status(401).json({ message: "Not authorized ,token failed1" })
      }
   }
  
   return res.status(401).json({ message: "Not authorized ,token failed2" })
}
