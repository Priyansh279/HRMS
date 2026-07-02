"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LeaveRequest_1 = require("../models/LeaveRequest");
const Employee_1 = require("../models/Employee");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const leaves = await LeaveRequest_1.LeaveRequest.find()
                .populate('employeeId', 'firstName lastName employeeId department')
                .sort({ createdAt: -1 })
                .lean();
            res.json(leaves);
            return;
        }
        const employee = await Employee_1.Employee.findOne({ userId: req.user.userId });
        if (!employee) {
            res.json([]);
            return;
        }
        const leaves = await LeaveRequest_1.LeaveRequest.find({ employeeId: employee._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json(leaves);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch leave requests', error: err.message });
    }
});
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('employee'), async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findOne({ userId: req.user.userId });
        if (!employee) {
            res.status(404).json({ message: 'Employee profile not found' });
            return;
        }
        const leave = await LeaveRequest_1.LeaveRequest.create({
            employeeId: employee._id,
            ...req.body,
        });
        res.status(201).json(leave);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to create leave request', error: err.message });
    }
});
router.patch('/:id/approve', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const leave = await LeaveRequest_1.LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'approved', approvedBy: req.user.userId, approvedAt: new Date() }, { new: true }).lean();
        if (!leave) {
            res.status(404).json({ message: 'Leave request not found' });
            return;
        }
        res.json(leave);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to approve leave', error: err.message });
    }
});
router.patch('/:id/reject', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const leave = await LeaveRequest_1.LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'rejected', approvedBy: req.user.userId, approvedAt: new Date() }, { new: true }).lean();
        if (!leave) {
            res.status(404).json({ message: 'Leave request not found' });
            return;
        }
        res.json(leave);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to reject leave', error: err.message });
    }
});
exports.default = router;
