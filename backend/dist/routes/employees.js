"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Employee_1 = require("../models/Employee");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const employees = await Employee_1.Employee.find().populate('userId', 'email').lean();
        res.json(employees);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
    }
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findOne({ userId: req.user.userId }).lean();
        if (!employee) {
            res.status(404).json({ message: 'Employee profile not found' });
            return;
        }
        res.json(employee);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
    }
});
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findById(req.params.id).populate('userId', 'email').lean();
        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }
        if (req.user.role === 'employee' && req.user.employeeId !== employee._id?.toString()) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        res.json(employee);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch employee', error: err.message });
    }
});
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const updated = await Employee_1.Employee.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
        if (!updated) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update employee', error: err.message });
    }
});
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { email, password, ...emp } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }
        const user = await User_1.User.create({
            email,
            password: password || 'ChangeMe123!',
            role: 'employee',
            employeeId: emp.employeeId,
        });
        const employee = await Employee_1.Employee.create({
            userId: user._id,
            ...emp,
            email,
        });
        res.status(201).json(employee);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to create employee', error: err.message });
    }
});
exports.default = router;
