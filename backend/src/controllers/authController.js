import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// REGISTER
export const registerUser = async (req, res) => {
    const { email, password, role } = req.body;

    // basic validation
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    // create user (password will auto-hash)
    const user = await User.create({
        email,
        password,
        role: role || "staff"
    });

    // success response
    res.status(201).json({
        token: generateToken(user._id),
        user: {
            id: user._id,
            email: user.email,
            role: user.role
        }
    });
};

// LOGIN
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        token: generateToken(user._id),
        user: {
            id: user._id,
            email: user.email,
            role: user.role
        }
    });
};
