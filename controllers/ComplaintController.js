const Complaint = require("../models/Complaint")
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery')

const ComplaintController = {

    // Create new complaint
    create: async (req, res) => {
        let {
            flatId, category, description, priority
        } = req.body

        try {

            if (!flatId || !category || !description) {
                return res.json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            let complaint = await Complaint.create({
                residentId: req.user.id,
                flatId,
                category,
                description,
                priority
            })

            return res.json({
                message: "Complaint created successfully",
                status: true,
                complaint
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Upload complaint photo
    uploadPhoto: async (req, res) => {
        let complaintId = req.params.id

        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "Please upload an image",
                    status: false
                })
            }

            let result = await new Promise((resolve, reject) => {

                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "complaint_images"
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error)
                        }

                        resolve(result)
                    }
                )

                streamifier
                    .createReadStream(req.file.buffer)
                    .pipe(stream)
            })

            if (!complaintId || !isValidObjectId(complaintId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

            let complaint = await Complaint.findByIdAndUpdate(
                complaintId,
                {
                    photo: result.secure_url
                },
                {
                    new: true
                }
            )

            if (complaint) {
                return res.json({
                    message: "Complaint photo uploaded successfully",
                    status: true,
                    photo: result.secure_url,
                    complaint
                })
            } else {
                return res.json({
                    message: "Complaint not found",
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


    // Get all complaints
    all: async (req, res) => {
        try {

            let complaints = await safeFindWithPopulate(Complaint, {}, ['residentId', 'flatId', 'assignedTo'])

            return res.json({
                message: complaints.length > 0 ? "All complaints get successfully" : "No complaints found",
                status: true,
                complaints: complaints || []
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get complaints of logged in resident
    myComplaints: async (req, res) => {
        try {

            let complaints = await safeFindWithPopulate(Complaint, {
                residentId: req.user.id
            }, ['flatId', 'assignedTo'])

            return res.json({
                message: complaints.length > 0 ? "Your complaints get successfully" : "No complaints found",
                status: true,
                complaints: complaints || []
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get single complaint
    getSingleComplaint: async (req, res) => {
        let complaintId = req.params.id

        try {

            let complaint = await safeFindByIdWithPopulate(Complaint, complaintId, ['residentId', 'flatId', 'assignedTo'])

            if (complaint) {
                return res.json({
                    message: "Complaint get successfully",
                    status: true,
                    complaint
                })
            } else {
                return res.json({
                    message: "No complaint found",
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


    // Assign complaint to staff
    assignComplaint: async (req, res) => {
        let complaintId = req.params.id
        let { assignedTo } = req.body

        try {

            if (!assignedTo) {
                return res.json({
                    message: "Assigned user is required",
                    status: false
                })
            }

            if (!complaintId || !isValidObjectId(complaintId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

            let complaint = await Complaint.findByIdAndUpdate(
                complaintId,
                {
                    assignedTo,
                    status: "in-progress"
                },
                {
                    new: true
                }
            )

            if (complaint) {
                return res.json({
                    message: "Complaint assigned successfully",
                    status: true,
                    complaint
                })
            } else {
                return res.json({
                    message: "Complaint not found",
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


    // Update complaint status
    updateStatus: async (req, res) => {
        let complaintId = req.params.id
        let {
            status,
            resolutionNotes
        } = req.body

        try {

            if (!status) {
                return res.json({
                    message: "Status is required",
                    status: false
                })
            }

            if (!complaintId || !isValidObjectId(complaintId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

            let updateData = {
                status
            }

            if (status === "resolved") {
                updateData.resolvedAt = new Date()
                updateData.resolutionNotes = resolutionNotes || null
            }

            let complaint = await Complaint.findByIdAndUpdate(
                complaintId,
                updateData,
                {
                    new: true
                }
            )

            if (complaint) {
                return res.json({
                    message: "Complaint status updated successfully",
                    status: true,
                    complaint
                })
            } else {
                return res.json({
                    message: "Complaint not found",
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


    // Update complaint priority
    updatePriority: async (req, res) => {
        let complaintId = req.params.id
        let { priority } = req.body

        try {

            if (!priority) {
                return res.json({
                    message: "Priority is required",
                    status: false
                })
            }

            if (!complaintId || !isValidObjectId(complaintId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

            let complaint = await Complaint.findByIdAndUpdate(
                complaintId,
                {
                    priority
                },
                {
                    new: true
                }
            )

            if (complaint) {
                return res.json({
                    message: "Complaint priority updated successfully",
                    status: true,
                    complaint
                })
            } else {
                return res.json({
                    message: "Complaint not found",
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


    // Set SLA deadline
    setSLA: async (req, res) => {
        let complaintId = req.params.id
        let { slaDeadline } = req.body

        try {

            if (!slaDeadline) {
                return res.json({
                    message: "SLA deadline is required",
                    status: false
                })
            }

            if (!complaintId || !isValidObjectId(complaintId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

            let complaint = await Complaint.findByIdAndUpdate(
                complaintId,
                {
                    slaDeadline
                },
                {
                    new: true
                }
            )

            if (complaint) {
                return res.json({
                    message: "SLA deadline set successfully",
                    status: true,
                    complaint
                })
            } else {
                return res.json({
                    message: "Complaint not found",
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


    // Delete complaint
    deleteComplaint: async (req, res) => {
        let complaintId = req.params.id

        try {

            if (!complaintId || !isValidObjectId(complaintId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

            let complaint = await Complaint.findByIdAndDelete(complaintId)

            if (complaint) {
                return res.json({
                    message: "Complaint deleted successfully",
                    status: true,
                    complaint
                })
            } else {
                return res.json({
                    message: "Complaint not found",
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

module.exports = ComplaintController
