// Authentication middleware
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    let token;

    // Check Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request (exclude password)
            req.user = await User.findById(decoded.id).select("-password");
            //Adding "-password" tells the database: "Give me everything except the password." 
            //This prevents accidental leaks of sensitive data further down the line.

            next();
        } catch (error) {
            return res.status(401).json({
                message: "Not authorized, token invalid"
            });
        }
    } else {
        return res.status(401).json({
            message: "Not authorized, no token"
        });
    }
};

export default protect;
