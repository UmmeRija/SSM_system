const express = require("express")
const router = express.Router()

const authmiddleware = require("../middleware/authmiddleware")
const NoticeController = require("../Controllers/NoticeController")


// http://localhost:3000/api/notice/create
router.post("/create", authmiddleware, NoticeController.create)


// http://localhost:3000/api/notice/all
router.get("/all", authmiddleware, NoticeController.all)


// http://localhost:3000/api/notice/all-notices
router.get("/all-notices", authmiddleware, NoticeController.allNotices)


// http://localhost:3000/api/notice/single/NOTICE_ID
router.get("/single/:id", authmiddleware, NoticeController.getSingleNotice)


// http://localhost:3000/api/notice/type/event
router.get("/type/:type", authmiddleware, NoticeController.getByType)


// http://localhost:3000/api/notice/update/NOTICE_ID
router.put("/update/:id", authmiddleware,NoticeController.updateNotice)


// http://localhost:3000/api/notice/activate/NOTICE_ID
router.put("/activate/:id", authmiddleware, NoticeController.activateNotice)


// http://localhost:3000/api/notice/deactivate/NOTICE_ID
router.put("/deactivate/:id", authmiddleware, NoticeController.deactivateNotice)


// http://localhost:3000/api/notice/delete/NOTICE_ID
router.delete("/delete/:id", authmiddleware, NoticeController.deleteNotice)


module.exports = router
