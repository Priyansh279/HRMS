"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Employee_1 = require("../models/Employee");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, department, designation, employeeId } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const existing = await User_1.User.findOne({ email });
        if (existing) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        const user = await User_1.User.create({
            email,
            password,
            role: role || 'employee',
            employeeId: employeeId || null,
        });
        if (firstName && lastName && department && designation && employeeId) {
            await Employee_1.Employee.create({
                userId: user._id,
                employeeId,
                firstName,
                lastName,
                email,
                department,
                designation,
                joinDate: new Date(),
            });
        }
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            employeeId: user.employeeId || undefined,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
    }
    catch (err) {
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const user = await User_1.User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const employee = await Employee_1.Employee.findOne({ userId: user._id });
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            employeeId: employee?._id?.toString() || user.employeeId || undefined,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                employeeId: employee?._id,
                employee: employee
                    ? {
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        department: employee.department,
                        designation: employee.designation,
                    }
                    : null,
            },
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findOne({ userId: req.user.userId }).lean();
        res.json({
            userId: req.user.userId,
            email: req.user.email,
            role: req.user.role,
            employeeId: req.user.employeeId,
            employee: employee || null,
        });
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});
exports.default = router;
