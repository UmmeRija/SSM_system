const Flat = require("../models/Flat");
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require("../utils/safeQuery");

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
        } = req.body;

        try {
            if (!flatNumber || !tower) {
                return res.status(400).json({
                    message: "Required fields are missing",
                    status: false
                });
            }

            if (ownerId && !isValidObjectId(ownerId)) {
                return res.status(400).json({ message: "Invalid Owner ID format", status: false });
            }

            if (tenantId && !isValidObjectId(tenantId)) {
                return res.status(400).json({ message: "Invalid Tenant ID format", status: false });
            }

            let existingFlat = await Flat.findOne({ flatNumber });
            if (existingFlat) {
                return res.status(400).json({
                    message: "Flat number already exists",
                    status: false
                });
            }

            let flat = await Flat.create({
                flatNumber,
                tower,
                occupancyStatus,
                ownerId: ownerId || null,
                tenantId: tenantId || null,
                floor,
                size
            });

            return res.status(201).json({
                message: "Flat created successfully",
                status: true,
                flat
            });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "Flat number already exists", status: false });
            }
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Get all flats
    all: async (req, res) => {
        try {
            let flats = await safeFindWithPopulate(Flat, {}, ['ownerId', 'tenantId']);

            return res.status(200).json({
                message: flats.length > 0 ? "All flats fetched successfully" : "No flats found",
                status: true,
                flats: flats || []
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Get single flat
    getSingleFlat: async (req, res) => {
        let flatId = req.params.id;

        try {
            if (!flatId || !isValidObjectId(flatId)) {
                return res.status(400).json({ message: "Invalid Flat ID", status: false });
            }

            let flat = await safeFindByIdWithPopulate(Flat, flatId, ['ownerId', 'tenantId']);

            if (!flat) {
                return res.status(404).json({
                    message: "Flat not found",
                    status: false
                });
            }

            return res.status(200).json({
                message: "Flat fetched successfully",
                status: true,
                flat
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Get occupied flats
    occupiedFlats: async (req, res) => {
        try {
            let flats = await safeFindWithPopulate(Flat, { occupancyStatus: "occupied" }, ['ownerId', 'tenantId']);

            return res.status(200).json({
                message: flats.length > 0 ? "Occupied flats fetched successfully" : "No occupied flats found",
                status: true,
                flats: flats || []
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Get vacant flats
    vacantFlats: async (req, res) => {
        try {
            let flats = await safeFindWithPopulate(Flat, { occupancyStatus: "vacant" }, ['ownerId', 'tenantId']);

            return res.status(200).json({
                message: flats.length > 0 ? "Vacant flats fetched successfully" : "No vacant flats found",
                status: true,
                flats: flats || []
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Assign owner to flat
    assignOwner: async (req, res) => {
        let flatId = req.params.id;
        let { ownerId } = req.body;

        try {
            if (!flatId || !isValidObjectId(flatId)) {
                return res.status(400).json({ message: "Invalid Flat ID", status: false });
            }

            if (!ownerId || !isValidObjectId(ownerId)) {
                return res.status(400).json({ message: "Valid Owner ID is required", status: false });
            }

            let flat = await safeFindByIdWithPopulate(Flat, flatId, []);

            if (!flat) {
                return res.status(404).json({ message: "Flat not found", status: false });
            }

            flat.ownerId = ownerId;
            flat.occupancyStatus = "occupied";

            await flat.save();

            return res.status(200).json({
                message: "Owner assigned successfully",
                status: true,
                flat
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Assign tenant to flat
    assignTenant: async (req, res) => {
        let flatId = req.params.id;
        let { tenantId } = req.body;

        try {
            if (!flatId || !isValidObjectId(flatId)) {
                return res.status(400).json({ message: "Invalid Flat ID", status: false });
            }

            if (!tenantId || !isValidObjectId(tenantId)) {
                return res.status(400).json({ message: "Valid Tenant ID is required", status: false });
            }

            let flat = await safeFindByIdWithPopulate(Flat, flatId, []);

            if (!flat) {
                return res.status(404).json({ message: "Flat not found", status: false });
            }

            flat.tenantId = tenantId;
            flat.occupancyStatus = "occupied";

            await flat.save();

            return res.status(200).json({
                message: "Tenant assigned successfully",
                status: true,
                flat
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Remove owner from flat
    removeOwner: async (req, res) => {
        let flatId = req.params.id;

        try {
            if (!flatId || !isValidObjectId(flatId)) {
                return res.status(400).json({ message: "Invalid Flat ID", status: false });
            }

            let flat = await safeFindByIdWithPopulate(Flat, flatId, []);

            if (!flat) {
                return res.status(404).json({ message: "Flat not found", status: false });
            }

            flat.ownerId = null;

            if (!flat.tenantId) {
                flat.occupancyStatus = "vacant";
            }

            await flat.save();

            return res.status(200).json({
                message: "Owner removed successfully",
                status: true,
                flat
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Remove tenant from flat
    removeTenant: async (req, res) => {
        let flatId = req.params.id;

        try {
            if (!flatId || !isValidObjectId(flatId)) {
                return res.status(400).json({ message: "Invalid Flat ID", status: false });
            }

            let flat = await safeFindByIdWithPopulate(Flat, flatId, []);

            if (!flat) {
                return res.status(404).json({ message: "Flat not found", status: false });
            }

            flat.tenantId = null;

            if (!flat.ownerId) {
                flat.occupancyStatus = "vacant";
            }

            await flat.save();

            return res.status(200).json({
                message: "Tenant removed successfully",
                status: true,
                flat
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Update occupancy status
    updateOccupancy: async (req, res) => {
        let flatId = req.params.id;
        let { occupancyStatus } = req.body;

        try {
            if (!occupancyStatus) {
                return res.status(400).json({ message: "Occupancy status is required", status: false });
            }

            if (!flatId || !isValidObjectId(flatId)) {
                return res.status(400).json({ message: "Invalid Flat ID", status: false });
            }

            let flat = await Flat.findByIdAndUpdate(
                flatId,
                { occupancyStatus },
                { new: true, runValidators: true }
            );

            if (!flat) {
                return res.status(404).json({ message: "Flat not found", status: false });
            }

            return res.status(200).json({
                message: "Occupancy status updated successfully",
                status: true,
                flat
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Update flat
    updateFlat: async (req, res) => {
        let flatId = req.params.id;

        try {
            if (!flatId || !isValidObjectId(flatId)) {
                return res.status(400).json({ message: "Invalid Flat ID", status: false });
            }

            let flat = await Flat.findByIdAndUpdate(
                flatId,
                req.body,
                { new: true, runValidators: true }
            );

            if (!flat) {
                return res.status(404).json({ message: "Flat not found", status: false });
            }

            return res.status(200).json({
                message: "Flat updated successfully",
                status: true,
                flat
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    },


    // Delete flat
    deleteFlat: async (req, res) => {
        let flatId = req.params.id;

        try {
            if (!flatId || !isValidObjectId(flatId)) {
                return res.status(400).json({ message: "Invalid Flat ID", status: false });
            }

            let flat = await Flat.findByIdAndDelete(flatId);

            if (!flat) {
                return res.status(404).json({ message: "Flat not found", status: false });
            }

            return res.status(200).json({
                message: "Flat deleted successfully",
                status: true,
                flat
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                status: false
            });
        }
    }

};

module.exports = FlatController;