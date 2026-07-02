"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Attendance_1 = require("../models/Attendance");
const Employee_1 = require("../models/Employee");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { employeeId, from, to } = req.query;
        if (req.user.role === 'admin' && employeeId) {
            const attendance = await Attendance_1.Attendance.find({
                employeeId,
                ...(from && to
                    ? { date: { $gte: new Date(from), $lte: new Date(to) } }
                    : {}),
            })
                .sort({ date: -1 })
                .lean();
            res.json(attendance);
            return;
        }
        const employee = await Employee_1.Employee.findOne({ userId: req.user.userId });
        if (!employee) {
            res.json([]);
            return;
        }
        const attendance = await Attendance_1.Attendance.find({
            employeeId: employee._id,
            ...(from && to
                ? { date: { $gte: new Date(from), $lte: new Date(to) } }
                : {}),
        })
            .sort({ date: -1 })
            .lean();
        res.json(attendance);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
    }
});
router.post('/check-in', auth_1.authenticate, (0, auth_1.requireRole)('employee'), async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findOne({ userId: req.user.userId });
        if (!employee) {
            res.status(404).json({ message: 'Employee profile not found' });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let record = await Attendance_1.Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        });
        if (record) {
            record.checkIn = record.checkIn || new Date();
            await record.save();
        }
        else {
            record = await Attendance_1.Attendance.create({
                employeeId: employee._id,
                date: today,
                checkIn: new Date(),
                status: 'present',
            });
        }
        res.json(record);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to check in', error: err.message });
    }
});
router.post('/check-out', auth_1.authenticate, (0, auth_1.requireRole)('employee'), async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findOne({ userId: req.user.userId });
        if (!employee) {
            res.status(404).json({ message: 'Employee profile not found' });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const record = await Attendance_1.Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        });
        if (!record) {
            res.status(400).json({ message: 'No check-in found for today' });
            return;
        }
        record.checkOut = new Date();
        await record.save();
        res.json(record);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to check out', error: err.message });
    }
});
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const updated = await Attendance_1.Attendance.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
        if (!updated) {
            res.status(404).json({ message: 'Attendance record not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update attendance', error: err.message });
    }
});
exports.default = router;
