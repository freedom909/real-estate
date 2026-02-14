import jwt from "jsonwebtoken";
function verifyJwt(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}
export default verifyJwt;
