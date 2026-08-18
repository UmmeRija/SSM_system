const Notice = require("../models/Notice")
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery')

const NoticeController = {

    // Create new notice
    create: async (req, res) => {
        let {
            title,
            content,
            body,
            type,
            category,
            priority,
            pinned,
            isActive,
            expiresAt,
            attachments
        } = req.body

        try {
            const finalBody = body || content || '';

            if (!title || !finalBody) {
                return res.json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            const finalType = type || (category === 'Security' ? 'emergency' : category === 'Event' ? 'event' : 'normal');
            const finalCategory = category || (finalType === 'emergency' ? 'Security' : finalType === 'event' ? 'Event' : 'General');

            let notice = await Notice.create({
                title,
                body: finalBody,
                content: finalBody,
                createdBy: req.user.id,
                type: finalType,
                category: finalCategory,
                priority: priority || (pinned ? 'high' : 'medium'),
                pinned: !!pinned,
                isActive: isActive !== undefined ? isActive : true,
                expiresAt,
                attachments: attachments || []
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

            let notices = await safeFindWithPopulate(Notice, {
                isActive: true
            }, ['createdBy'])

            return res.json({
                message: notices.length > 0 ? "All notices get successfully" : "No notices found",
                status: true,
                notices: notices || []
            })

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

            let notices = await safeFindWithPopulate(Notice, {}, ['createdBy'])

            return res.json({
                message: notices.length > 0 ? "All notices get successfully" : "No notices found",
                status: true,
                notices: notices || []
            })

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

            let notice = await safeFindByIdWithPopulate(Notice, noticeId, ['createdBy'])

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

            let notices = await safeFindWithPopulate(Notice, {
                type,
                isActive: true
            }, ['createdBy'])

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

            if (!noticeId || !isValidObjectId(noticeId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

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

            if (!noticeId || !isValidObjectId(noticeId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

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

            if (!noticeId || !isValidObjectId(noticeId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

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

            if (!noticeId || !isValidObjectId(noticeId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

            let notice = await Notice.findByIdAndDelete(noticeId)

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
