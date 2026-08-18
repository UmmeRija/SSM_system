const EmergencyAlert = require('../models/EmergencyAlert');
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery');

const EmergencyAlertController = {
    create: async (req, res) => {
        const { title, message, type, severity, affectedAreas } = req.body;
        try {
            if (!title || !message || !type) {
                return res.json({
                    message: "Required fields missing",
                    status: false
                });
            }

            const alert = await EmergencyAlert.create({
                title,
                message,
                type,
                severity: severity || 'high',
                createdBy: req.user.id,
                affectedAreas: affectedAreas || []
            });

            return res.json({
                message: "Emergency alert triggered successfully",
                status: true,
                alert
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    all: async (req, res) => {
        try {
            const alerts = await safeFindWithPopulate(EmergencyAlert, {}, ['createdBy']);
            return res.json({
                message: "Emergency alerts retrieved successfully",
                status: true,
                alerts
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    active: async (req, res) => {
        try {
            const alerts = await safeFindWithPopulate(EmergencyAlert, { isActive: true }, ['createdBy']);
            return res.json({
                message: "Active emergency alerts retrieved successfully",
                status: true,
                alerts
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    resolve: async (req, res) => {
        const alertId = req.params.id;
        try {
            const alert = await safeFindByIdWithPopulate(EmergencyAlert, alertId, []);
            if (!alert) {
                return res.json({
                    message: "Alert not found",
                    status: false
                });
            }

            alert.isActive = false;
            alert.resolvedAt = new Date();
            alert.resolvedBy = req.user.id;
            await alert.save();

            return res.json({
                message: "Emergency alert resolved successfully",
                status: true,
                alert
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    directory: async (req, res) => {
        return res.json({
            status: true,
            directory: [
                { id: '1', name: 'Main Gate Security', phone: '021-3456789', role: 'Security' },
                { id: '2', name: 'Fire Station', phone: '16', role: 'Emergency Services' },
                { id: '3', name: 'Ambulance (Edhi)', phone: '115', role: 'Medical' },
                { id: '4', name: 'Maintenance Office', phone: '021-9876543', role: 'Staff' }
            ]
        });
    }
};

module.exports = EmergencyAlertController;
