const StaffAttendance = require('../models/StaffAttendance');

const StaffAttendanceController = {
    checkIn: async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0,0,0,0);

            let attendance = await StaffAttendance.findOne({
                staffId: req.user.id,
                date: today
            });

            if (attendance) {
                return res.json({
                    message: "Already checked in today",
                    status: false
                });
            }

            attendance = await StaffAttendance.create({
                staffId: req.user.id,
                date: today,
                checkIn: new Date(),
                status: 'present'
            });

            return res.json({
                message: "Checked in successfully",
                status: true,
                attendance
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    checkOut: async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0,0,0,0);

            const attendance = await StaffAttendance.findOne({
                staffId: req.user.id,
                date: today
            });

            if (!attendance) {
                return res.json({
                    message: "No check-in record found for today",
                    status: false
                });
            }

            attendance.checkOut = new Date();
            if (attendance.checkIn) {
                const diffMs = attendance.checkOut - attendance.checkIn;
                attendance.workedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
            }
            await attendance.save();

            return res.json({
                message: "Checked out successfully",
                status: true,
                attendance
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    myAttendance: async (req, res) => {
        try {
            const attendance = await StaffAttendance.find({ staffId: req.user.id }).sort({ date: -1 });
            return res.json({
                status: true,
                attendance
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    }
};

module.exports = StaffAttendanceController;
