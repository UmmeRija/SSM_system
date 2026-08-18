const jwt = require('jsonwebtoken')

const authmiddleware = async (req, res, next) => {
    try {
        let token = req.cookies.token

        // Support Authorization Bearer token header fallback
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({
                message: "Token is missing",
                status: false
            })
        }

        let decodeduser = await jwt.verify(
            token,
            process.env.JWTSECRET
        )

        if (
            decodeduser.role === "admin" ||
            decodeduser.role === "resident" ||
            decodeduser.role === "security" ||
            decodeduser.role === "staff"
        ) {
            if (!decodeduser.id) {
                return res.status(401).json({
                    message: "Invalid token: missing user ID",
                    status: false
                })
            }
            req.user = decodeduser
            next()
        } else {
            return res.status(403).json({
                message: "Unauthorized user",
                status: false
            })
        }

    } catch (error) {
        return res.status(401).json({
            message: error.message,
            status: false
        })
    }
}

module.exports = authmiddleware