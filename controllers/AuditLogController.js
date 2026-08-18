const AuditLog = require('../models/AuditLog');
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery');

const AuditLogController = {
    logAction: async (userId, action, module, details, ipAddress) => {
        try {
            await AuditLog.create({
                userId,
                action,
                module,
                details,
                ipAddress
            });
        } catch (error) {
            console.error("Failed to write audit log:", error);
        }
    },

    all: async (req, res) => {
        try {
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 20;
            let skip = (page - 1) * limit;

            const total = await AuditLog.countDocuments();
            const logs = await safeFindWithPopulate(AuditLog, {}, ['userId'], {
                sort: { createdAt: -1 },
                skip: skip,
                limit: limit
            });

            return res.json({
                status: true,
                message: "Audit logs retrieved successfully",
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                auditLogs: logs
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    }
};

module.exports = AuditLogController;
