const express = require("express")
const router = express.Router()
const authmiddleware = require("../middleware/authmiddleware")
const UserController = require("../controllers/UserController")



// http://localhost:3000/api/user/register
router.post("/register", UserController.register)


// http://localhost:3000/api/user/login
router.post("/login", UserController.login)



// http://localhost:3000/api/user/all
router.get("/all", UserController.all)


// http://localhost:3000/api/user/single/USER_ID
router.get("/single/:id", UserController.getSingleUser)



// http://localhost:3000/api/user/profile
router.get("/profile",authmiddleware, UserController.profile)


// http://localhost:3000/api/user/update/USER_ID
router.put("/update/:id",authmiddleware, UserController.updateUser)


// http://localhost:3000/api/user/delete/USER_ID
router.delete("/delete/:id", authmiddleware, UserController.deleteUser)



// http://localhost:3000/api/user/upload-image/USER_ID
router.put("/upload-image/:id", authmiddleware, UserController.uploadImage)


module.exports = router