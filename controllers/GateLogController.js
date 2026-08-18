const GateLog = require('../models/GateLog');
const Visitor = require('../models/Visitor');
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery');

const GateLogController = {
    create: async (req, res) => {
        const { flatId, visitorId, action, remarks, gateNumber, name, phone, vehicleNumber, type } = req.body;
        try {
            if (!flatId || !action) {
                return res.json({
                    message: "Required fields flatId or action missing",
                    status: false
                });
            }

            const log = await GateLog.create({
                flatId,
                visitorId: visitorId || null,
                guardId: req.user.id,
                action,
                remarks,
                gateNumber: gateNumber || 'Main Gate',
                name: name || null,
                phone: phone || null,
                vehicleNumber: vehicleNumber || null,
                type: type || null,
                overstay: false
            });

            return res.json({
                message: "Gate log entry created successfully",
                status: true,
                log
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
            const logs = await safeFindWithPopulate(GateLog, {}, ['flatId', 'visitorId', 'guardId']);

            return res.json({
                message: "Gate logs retrieved successfully",
                status: true,
                gateLogs: logs
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    exitVisitor: async (req, res) => {
        const { logId } = req.body;
        try {
            const log = await safeFindByIdWithPopulate(GateLog, logId, []);
            if (!log) {
                return res.json({
                    message: "Log entry not found",
                    status: false
                });
            }

            log.action = 'exit';
            log.timestamp = new Date();
            log.checkOut = new Date();
            await log.save();

            if (log.visitorId) {
                await Visitor.findByIdAndUpdate(log.visitorId, { status: 'exited', exitTime: new Date() });
            }

            return res.json({
                message: "Visitor exited gate successfully",
                status: true,
                log
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    flagOverstay: async (req, res) => {
        const logId = req.params.id;
        const { overstay } = req.body;
        try {
            if (!logId || !isValidObjectId(logId)) {
                return res.json({ message: "Invalid log ID", status: false });
            }
            const log = await GateLog.findByIdAndUpdate(
                logId,
                { overstay: overstay !== false },
                { new: true }
            );
            if (!log) return res.json({ message: "Log not found", status: false });
            return res.json({ status: true, message: "Overstay flag updated", log });
        } catch (error) {
            return res.json({ message: error.message, status: false });
        }
    }
};

module.exports = GateLogController;
