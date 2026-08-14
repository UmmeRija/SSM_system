const Notice = require("../models/Notice")

const NoticeController = {

    // Create new notice
    create: async (req, res) => {
        let {
            title,
            content,
            type,
            priority,
            expiresAt,
            attachments
        } = req.body

        try {

            if (!title || !content) {
                return res.json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            let notice = await Notice.create({
                title,
                content,
                createdBy: req.user.id,
                type,
                priority,
                expiresAt,
                attachments
            })

            return res.json({
                message: "Notice created successfully",
                status: true,
                notice
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get all active notices
    all: async (req, res) => {
        try {

            let notices = await Notice.find({
                isActive: true
            })
                .populate("createdBy")
                .sort({ createdAt: -1 })

            if (notices.length > 0) {
                return res.json({
                    message: "All notices get successfully",
                    status: true,
                    notices
                })
            } else {
                return res.json({
                    message: "No notices found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get all notices including inactive notices
    allNotices: async (req, res) => {
        try {

            let notices = await Notice.find({})
                .populate("createdBy")
                .sort({ createdAt: -1 })

            if (notices.length > 0) {
                return res.json({
                    message: "All notices get successfully",
                    status: true,
                    notices
                })
            } else {
                return res.json({
                    message: "No notices found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get single notice
    getSingleNotice: async (req, res) => {
        let noticeId = req.params.id

        try {

            let notice = await Notice.findById(noticeId)
                .populate("createdBy")

            if (notice) {

                notice.views = notice.views + 1

                await notice.save()

                return res.json({
                    message: "Notice get successfully",
                    status: true,
                    notice
                })

            } else {
                return res.json({
                    message: "No notice found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get notices by type
    getByType: async (req, res) => {
        let type = req.params.type

        try {

            let notices = await Notice.find({
                type,
                isActive: true
            })
                .populate("createdBy")
                .sort({ createdAt: -1 })

            if (notices.length > 0) {
                return res.json({
                    message: "Notices get successfully",
                    status: true,
                    notices
                })
            } else {
                return res.json({
                    message: "No notices found for this type",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Update notice
    updateNotice: async (req, res) => {
        let noticeId = req.params.id

        try {

            let notice = await Notice.findByIdAndUpdate(
                noticeId,
                req.body,
                {
                    new: true
                }
            )

            if (notice) {
                return res.json({
                    message: "Notice updated successfully",
                    status: true,
                    notice
                })
            } else {
                return res.json({
                    message: "Notice not found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Activate notice
    activateNotice: async (req, res) => {
        let noticeId = req.params.id

        try {

            let notice = await Notice.findByIdAndUpdate(
                noticeId,
                {
                    isActive: true
                },
                {
                    new: true
                }
            )

            if (notice) {
                return res.json({
                    message: "Notice activated successfully",
                    status: true,
                    notice
                })
            } else {
                return res.json({
                    message: "Notice not found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Deactivate notice
    deactivateNotice: async (req, res) => {
        let noticeId = req.params.id

        try {

            let notice = await Notice.findByIdAndUpdate(
                noticeId,
                {
                    isActive: false
                },
                {
                    new: true
                }
            )

            if (notice) {
                return res.json({
                    message: "Notice deactivated successfully",
                    status: true,
                    notice
                })
            } else {
                return res.json({
                    message: "Notice not found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Delete notice
    deleteNotice: async (req, res) => {
        let noticeId = req.params.id

        try {

            let notice = await Notice.findByIdAndDelete({
                _id: noticeId
            })

            if (notice) {
                return res.json({
                    message: "Notice deleted successfully",
                    status: true,
                    notice
                })
            } else {
                return res.json({
                    message: "Notice not found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    }

}

module.exports = NoticeController
