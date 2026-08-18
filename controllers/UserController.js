const Users = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery');

function serializeUser(user) {
    if (!user) return null;
    const flatDoc = user.flatId && typeof user.flatId === 'object' ? user.flatId : null;
    const flatIdValue = flatDoc ? (flatDoc._id || flatDoc.id) : (user.flatId || null);
    return {
        id: user._id ? String(user._id) : user.id,
        _id: user._id ? String(user._id) : user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        flatId: flatIdValue ? String(flatIdValue) : null,
        flatNumber: flatDoc ? flatDoc.flatNumber || null : null,
        tower: flatDoc ? flatDoc.tower || null : null,
        phone: user.phone,
        vehicleNo: user.vehicleNo,
        emergencyContact: user.emergencyContact,
        imgUrl: user.imgUrl
    };
}

const UserController = {
    register: async (req, res) => {
        let { name, email, password, role, flatId, phone } = req.body;
        try {
            if (!name || !email || !password) {
                return res.json({
                    message: "Required field is missing",
                    status: false
                });
            } else {
                let existingUser = await Users.findOne({ email });
                if (existingUser) {
                    return res.json({
                        message: "Email already existed",
                        status: false,
                    });
                } else {
                    let hashPass = await bcrypt.hash(password, 10);
                    let newuser = await Users.create({ 
                        name, 
                        email, 
                        password: hashPass, 
                        role: role || 'resident',
                        flatId: flatId || null,
                        phone: phone || null
                    });
                    return res.json({
                        message: "Account created",
                        status: true,
                        newuser
                    });
                }
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false
            });
        }
    },

    login: async (req, res) => {
        let { email, password } = req.body;
        try {
            if (!email || !password) {
                return res.json({
                    message: "Required fields are missing",
                    status: false,
                });
            } else {
                let existingUser = await Users.findOne({ email }).populate('flatId');
                if (!existingUser) {
                    return res.json({
                        message: "Email doesn't exist",
                        status: false,
                    });
                } else {
                    let isMatch = await bcrypt.compare(password, existingUser.password);
                    if (isMatch) {
                        let token = await jwt.sign({
                            id: existingUser._id, 
                            role: existingUser.role,
                            email: existingUser.email
                        },
                            process.env.JWTSECRET,
                            { expiresIn: '1d' }
                        );
                        
                        res.cookie("token", token, {
                            httpOnly: true,
                            secure: false,
                            sameSite: 'lax',
                            maxAge: 24 * 60 * 60 * 1000
                        });

                        const userResponse = serializeUser(existingUser);

                        if (existingUser.role === 'resident' && !existingUser.flatId) {
                            existingUser.flatId = null;
                            await existingUser.save();
                        }

                        return res.json({
                            message: "Login success",
                            status: true,
                            token,
                            user: userResponse
                        });
                    } else {
                        return res.json({
                            message: "Invalid Password",
                            status: false,
                        });
                    }
                }
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false
            });
        }
    },

    logout: async (req, res) => {
        res.clearCookie("token");
        return res.json({
            message: "Logged out successfully",
            status: true
        });
    },

    mfaVerify: async (req, res) => {
        let { code } = req.body;
        if (code === "123456" || code === 123456) {
            return res.json({
                message: "MFA code verified successfully",
                status: true
            });
        } else {
            return res.json({
                message: "Invalid MFA code",
                status: false
            });
        }
    },

    all: async (req, res) => {
        try {
            let user = await Users.find({});
            return res.json({
                message: "All Users retrieved successfully",
                status: true,
                users: user.map(serializeUser),
                Users: user.map(serializeUser)
            });
        } catch (error) {
            res.json({
                message: error.message,
                status: false
            });
        }
    },

    profile: async (req, res) => {
        let userId = req.user?.id;
        if (!userId || userId === 'undefined' || !isValidObjectId(userId)) {
            return res.json({
                message: "Unauthorized: invalid token payload",
                status: false
            });
        }
        try {
            let user = await Users.findOne({ _id: userId });
            if (user) {
                return res.json({
                    message: "user get successfully",
                    status: true,
                    user: serializeUser(user)
                });
            } else {
                return res.json({
                    message: "No user in DB",
                    status: false
                });
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false
            });
        }
    },

    getSingleUser: async (req, res) => {
        let userId = req.params.id;
        if (!userId || userId === 'undefined' || !isValidObjectId(userId)) {
            return res.json({
                message: "Invalid or missing user ID",
                status: false
            });
        }
        try {
            let user = await Users.findOne({ _id: userId });
            if (user) {
                return res.json({
                    message: "user get successfully",
                    status: true,
                    user: serializeUser(user)
                });
            } else {
                return res.json({
                    message: "No user in DB",
                    status: false
                });
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false
            });
        }
    },

    deleteUser: async (req, res) => {
        let userId = req.params.id;
        if (!userId || userId === 'undefined' || !isValidObjectId(userId)) {
            return res.json({
                message: "Valid User ID is required",
                status: false
            });
        }
        try {
            let user = await Users.findByIdAndDelete(userId);
            if (user) {
                return res.json({
                    message: "user deleted successfully",
                    status: true,
                    user
                });
            } else {
                return res.json({
                    message: "No user in DB",
                    status: false
                });
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false
            });
        }
    },

    updateUser: async (req, res) => {
        let userId = req.params.id;
        if (!userId || userId === 'undefined' || !isValidObjectId(userId)) {
            return res.json({
                message: "Valid User ID is required",
                status: false
            });
        }
        try {
            let user = await Users.findByIdAndUpdate(userId, req.body, { new: true });
            if (user) {
                return res.json({
                    message: "user updated successfully",
                    status: true,
                    user
                });
            } else {
                return res.json({
                    message: "Failed to update user",
                    status: false
                });
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false
            });
        }
    },

    uploadImage: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined' || !isValidObjectId(id)) {
                return res.status(400).json({
                    status: false, 
                    message: "Valid User ID is required",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    status: false, 
                    message: "Please upload an image",
                });
            }

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "profile_images" },
                    (error, result) => {
                        if (error) return reject(error); 
                        resolve(result);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

            const user = await Users.findByIdAndUpdate(
                id,
                { imgUrl: result.secure_url },
                { new: true }
            );

            res.status(200).json({
                status: true, 
                message: "Image uploaded successfully", 
                image: result.secure_url,
                user,
            });
        } catch (error) {
            res.status(500).json({
                status: false, 
                message: error.message,
            });
        }
    }
};

module.exports = UserController;