import UserModel from '../Models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// register new users
export const registerUser = async (req, res) => {

    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    let pass = password.toString();
    const hashedPass = await bcrypt.hash(pass, parseInt(salt));
    req.body.password = hashedPass;

    const newUser = new UserModel(req.body);


    try {

        const oldUser = await UserModel.findOne({ email });

        if (oldUser) {
            return res.status(400).json({ message: "This User already exists!" })
        }

        const user = await newUser.save();

        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY);

        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Login users

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email: email });

        if (user) {
            const validity = await bcrypt.compare(password, user.password)

            if (!validity) {
                res.status(400).json({ status: "ERROR" ,  message: "Soory, Please enter the correct email or password!"});
            } else {
                const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY);
                res.status(200).json({ user, token });
            }
        } else {
            res.status(404).json({ status: "ERROR" ,  message: "User doesn't exist!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const handleOAuthLogin = async (req, res) => {
    const { email, firstname, lastname,oauthType, profilePicture, type } = req.body;

    try {
        if (type === 'oauth') {
            // Check if user already exists
            const existingUser = await UserModel.findOne({ email });

            if (existingUser) {
                // User exists - generate token and return
                const token = jwt.sign(
                    { email: existingUser.email, id: existingUser._id },
                    process.env.JWT_KEY
                );
                return res.status(200).json({ user: existingUser, token });
            }

            // Create new user for OAuth
            const newUser = new UserModel({
                email,
                firstname,
                lastname,
                profilePicture,
                oauthType,
                // Generate random password for OAuth users
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });

            const savedUser = await newUser.save();
            const token = jwt.sign(
                { email: savedUser.email, id: savedUser._id },
                process.env.JWT_KEY
            );

            res.status(200).json({ user: savedUser, token });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}