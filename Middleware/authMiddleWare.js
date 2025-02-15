import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_KEY;

const authMiddleWare = async (req, res, next) => {
    try {
        const token = req?.headers?.authorization?.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, secret);
            req.body.userId = decoded?.id;
            next();
        }else{
            return res.status(401).json({ message: "Unauthorized User" });
        }
    } catch (error) {
            return res.status(401).json({ message: "Unauthorized User" });
    }
}


export default authMiddleWare;