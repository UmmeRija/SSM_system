const Flat = require("../models/Flat")

const FlatController = {

    // Create new flat
    create: async (req, res) => {
        let {
            flatNumber,
            tower,
            occupancyStatus,
            ownerId,
            tenantId,
            floor,
            size
        } = req.body

        try {

            if (!flatNumber || !tower) {
                return res.json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            let existingFlat = await Flat.findOne({
                flatNumber
            })

            if (existingFlat) {
                return res.json({
                    message: "Flat number already existed",
                    status: false
                })
            }

            let flat = await Flat.create({
                flatNumber,
                tower,
                occupancyStatus,
                ownerId,
                tenantId,
                floor,
                size
            })

            return res.json({
                message: "Flat created successfully",
                status: true,
                flat
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get all flats
    all: async (req, res) => {
        try {

            let flats = await Flat.find({})
                .populate("ownerId")
                .populate("tenantId")
                .sort({ tower: 1, flatNumber: 1 })

            if (flats.length > 0) {
                return res.json({
                    message: "All flats get successfully",
                    status: true,
                    flats
                })
            } else {
                return res.json({
                    message: "No flats found",
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


    // Get single flat
    getSingleFlat: async (req, res) => {
        let flatId = req.params.id

        try {

            let flat = await Flat.findById(flatId)
                .populate("ownerId")
                .populate("tenantId")

            if (flat) {
                return res.json({
                    message: "Flat get successfully",
                    status: true,
                    flat
                })
            } else {
                return res.json({
                    message: "No flat found",
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


    // Get occupied flats
    occupiedFlats: async (req, res) => {
        try {

            let flats = await Flat.find({
                occupancyStatus: "occupied"
            })
                .populate("ownerId")
                .populate("tenantId")
                .sort({ tower: 1, flatNumber: 1 })

            if (flats.length > 0) {
                return res.json({
                    message: "Occupied flats get successfully",
                    status: true,
                    flats
                })
            } else {
                return res.json({
                    message: "No occupied flats found",
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


    // Get vacant flats
    vacantFlats: async (req, res) => {
        try {

            let flats = await Flat.find({
                occupancyStatus: "vacant"
            })
                .populate("ownerId")
                .populate("tenantId")
                .sort({ tower: 1, flatNumber: 1 })

            if (flats.length > 0) {
                return res.json({
                    message: "Vacant flats get successfully",
                    status: true,
                    flats
                })
            } else {
                return res.json({
                    message: "No vacant flats found",
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


    // Assign owner to flat
    assignOwner: async (req, res) => {
        let flatId = req.params.id
        let { ownerId } = req.body

        try {

            if (!ownerId) {
                return res.json({
                    message: "Owner ID is required",
                    status: false
                })
            }

            let flat = await Flat.findById(flatId)

            if (!flat) {
                return res.json({
                    message: "Flat not found",
                    status: false
                })
            }

            flat.ownerId = ownerId
            flat.occupancyStatus = "occupied"

            await flat.save()

            return res.json({
                message: "Owner assigned successfully",
                status: true,
                flat
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Assign tenant to flat
    assignTenant: async (req, res) => {
        let flatId = req.params.id
        let { tenantId } = req.body

        try {

            if (!tenantId) {
                return res.json({
                    message: "Tenant ID is required",
                    status: false
                })
            }

            let flat = await Flat.findById(flatId)

            if (!flat) {
                return res.json({
                    message: "Flat not found",
                    status: false
                })
            }

            flat.tenantId = tenantId
            flat.occupancyStatus = "occupied"

            await flat.save()

            return res.json({
                message: "Tenant assigned successfully",
                status: true,
                flat
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Remove owner from flat
    removeOwner: async (req, res) => {
        let flatId = req.params.id

        try {

            let flat = await Flat.findById(flatId)

            if (!flat) {
                return res.json({
                    message: "Flat not found",
                    status: false
                })
            }

            flat.ownerId = null

            if (!flat.tenantId) {
                flat.occupancyStatus = "vacant"
            }

            await flat.save()

            return res.json({
                message: "Owner removed successfully",
                status: true,
                flat
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Remove tenant from flat
    removeTenant: async (req, res) => {
        let flatId = req.params.id

        try {

            let flat = await Flat.findById(flatId)

            if (!flat) {
                return res.json({
                    message: "Flat not found",
                    status: false
                })
            }

            flat.tenantId = null

            if (!flat.ownerId) {
                flat.occupancyStatus = "vacant"
            }

            await flat.save()

            return res.json({
                message: "Tenant removed successfully",
                status: true,
                flat
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Update occupancy status
    updateOccupancy: async (req, res) => {
        let flatId = req.params.id
        let { occupancyStatus } = req.body

        try {

            if (!occupancyStatus) {
                return res.json({
                    message: "Occupancy status is required",
                    status: false
                })
            }

            let flat = await Flat.findByIdAndUpdate(
                flatId,
                {
                    occupancyStatus
                },
                {
                    new: true
                }
            )

            if (flat) {
                return res.json({
                    message: "Occupancy status updated successfully",
                    status: true,
                    flat
                })
            } else {
                return res.json({
                    message: "Flat not found",
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


    // Update flat
    updateFlat: async (req, res) => {
        let flatId = req.params.id

        try {

            let flat = await Flat.findByIdAndUpdate(
                flatId,
                req.body,
                {
                    new: true
                }
            )

            if (flat) {
                return res.json({
                    message: "Flat updated successfully",
                    status: true,
                    flat
                })
            } else {
                return res.json({
                    message: "Flat not found",
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


    // Delete flat
    deleteFlat: async (req, res) => {
        let flatId = req.params.id

        try {

            let flat = await Flat.findByIdAndDelete({
                _id: flatId
            })

            if (flat) {
                return res.json({
                    message: "Flat deleted successfully",
                    status: true,
                    flat
                })
            } else {
                return res.json({
                    message: "Flat not found",
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

module.exports = FlatController
