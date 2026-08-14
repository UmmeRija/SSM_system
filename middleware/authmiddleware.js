const jwt = require('jsonwebtoken')

const authmiddleware = async (req, res, next) => {
    try {
        let token = req.cookies.token

        if (!token) {
            return res.json({
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
            req.user = decodeduser
            next()
        } else {
            return res.json({
                message: "Unauthorized user",
                status: false
            })
        }

    } catch (error) {
        return res.json({
            message: error.message,
            status: false
        })
    }
}

module.exports = authmiddleware