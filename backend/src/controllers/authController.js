import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// REGISTER — DISABLED
// Registration is commented out because:
// 1. SnackTrack uses pre-seeded owner/staff accounts (no self-signup needed).
// 2. Security risk: the endpoint accepted a "role" field from the request body,
//    meaning anyone could POST { role: "owner" } and gain full owner access.
// 3. If new accounts are needed, they should be created manually in the database
//    or via a protected admin-only route.

// export const registerUser = async (req, res) => {
//     const { email, password, role } = req.body;
//
//     if (!email || !password) {
//         return res.status(400).json({
//             message: "Email and password are required"
//         });
//     }
//
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//         return res.status(400).json({
//             message: "User already exists"
//         });
//     }
//
//     const user = await User.create({
//         email,
//         password,
//         role: role || "staff"
//     });
//
//     res.status(201).json({
//         token: generateToken(user._id),
//         user: {
//             id: user._id,
//             email: user.email,
//             role: user.role
//         }
//     });
// };

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
