import UserModel from '../Models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';


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



export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });
export const googleAuthCallback = async (req, res) => {
   passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error authenticating with Google' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

const token = jwt.sign({id:user._id , email:user.email}, process.env.JWT_SECRET,{expiresIn:'1h'});

res.status(200).json({message:"login sucessfull",token,user});


});(req,res)
}
export const logoutUser = (req,res)=>{
    req.logout((err)=>{
        if(err){
            return res.status(500).json({message:"Error logging out"});
        }
        res.redirect("/login");
    })
}