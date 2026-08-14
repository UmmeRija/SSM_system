const Users = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const UserController = {
    register: async (req, res) => {
        let { name, email, password, role } = req.body
        try {
            if (!name || !email || !password) {
                return res.json({
                    message: "Required field is missing",
                    status: false
                })
            } else {
                let existingUser = await Users.findOne({ email })
                if (existingUser) {
                    return res.json({
                        message: "Email already existed",
                        status: false,
                    })
                } else {
                    let hashPass = await bcrypt.hash(password, 10)
                    let newuser = await Users.create({ name, email, password: hashPass, role })
                    return res.json({
                        message: "Account created",
                        status: true,
                        newuser
                    })
                }

            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },
    login: async (req, res) => {
        let { email, password } = req.body
        console.log("login api ------------------------------")
        try {
            if (!email || !password) {
                return res.json({
                    message: "Required fields are missing",
                    status: false,
                })
            } else {
                let existingUser = await Users.findOne({ email })
                if (!existingUser) {
                    return res.json({
                        message: "Email doesn't exist",
                        status: false,
                    })
                } else {
                    let isMatch = await bcrypt.compare(password, existingUser.password)
                    if (isMatch) {
                        let token = await jwt.sign({
                            id: existingUser._id, role: existingUser.role,
                            email: existingUser.email
                        },
                            process.env.JWTSECRET,
                            { expiresIn: '1d' })
                        res.cookie("token", token)
                        return res.json({
                            message: "Login success",
                            status: true,
                        })
                    } else {
                        return res.json({
                            message: "Invalid Password",
                            status: false,
                        })
                    }
                }
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },
    all: async (req, res) => {
        try {
            let user = await Users.find({})
            if (Users.length > 0) {
                res.json({
                    message: "All Users get succesfully",
                    status: true,
                    Users: user
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }

    },
     profile: async (req, res) => {
        let userId = req.user.id
        try {
            let user = await Users.findOne({ _id: userId })
            if (user) {
                return res.json({
                    message: "user get successfully",
                    status: true,
                    user
                })
            } else {
                return res.json({
                    message: "No user in DB",
                    status: false
                })
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false,

            })
        }
    },

     getSingleUser: async (req, res) => {
        let userId = req.params.id
        try {
            let user = await Users.findOne({ _id: userId })
            if (user) {
                return res.json({
                    message: "user get successfully",
                    status: true,
                    user
                })
            } else {
                return res.json({
                    message: "No user in DB",
                    status: false
                })
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false,

            })
        }
    },


    deleteUser: async (req, res) => {
        let userId = req.params.id
        try {
            let user = await Users.findByIdAndDelete({ _id: userId })
            if (user) {
                return res.json({
                    message: "user deleted successfully",
                    status: true,
                    user
                })
            } else {
                return res.json({
                    message: "No user in DB",
                    status: false
                })
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false,

            })
        }
    },
    updateUser: async (req, res) => {
        let userId = req.params.id
        try {
            let user = await Users.findByIdAndUpdate(userId, req.body, { new: true })
            if (user) {
                return res.json({
                    message: "user updated successfully",
                    status: true,
                    user
                })
            } else {
                return res.json({
                    message: "Failed to update user",
                    status: false
                })
            }
        } catch (error) {
            res.json({
                message: error.message,
                status: false,

            })
        }
    },

    uploadImage: async (req, res) => {
        try {
            const { id } = req.params;


            if (!req.file) {
                return res.status(400).json({
                    status: false, message: "Please upload an image",
                });
            }

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "profile_images",
                    },
                    (error, result) => {
                        if (error) return reject(error); resolve(result);
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

            const user = await Users.findByIdAndUpdate(
                id,
                {
                    imgUrl: result.secure_url,
                },
                { new: true }
            );

            res.status(200).json({
                status: true, message: "Image uploaded successfully", image: result.secure_url,
                user,
            });
        } catch (error) {
            res.status(500).json({
                status: false, message: error.message,
            });
        }
    }

}
module.exports = UserController