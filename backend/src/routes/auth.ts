import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Employee } from "../models/Employee";
import { authenticate, requireRole } from "../middleware/auth";
import { JwtPayload, UserRole } from "../types";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      department,
      designation,
      employeeId,
    } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const { bankName, accountNumber, ifscCode, accountHolderName } = req.body;

    const user = await User.create({
      email,
      password,
      role: role || "employee",
      employeeId: employeeId || null,
    });
    if (firstName && lastName && department && designation && employeeId) {
      await Employee.create({
        userId: user._id,
        employeeId,
        firstName,
        lastName,
        email,
        department,
        designation,
        joinDate: new Date(),
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
      });
    }
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      employeeId: user.employeeId || undefined,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    res
      .status(201)
      .json({
        token,
        user: { id: user._id, email: user.email, role: user.role },
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: (err as Error).message });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const employee = await Employee.findOne({ userId: user._id });
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      employeeId: employee?._id?.toString() || user.employeeId || undefined,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
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
  } catch (err) {
    res
      .status(500)
      .json({ message: "Login failed", error: (err as Error).message });
  }
});

router.get(
  "/me",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await Employee.findOne({
        userId: req.user!.userId,
      }).lean();
      res.json({
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role,
        employeeId: req.user!.employeeId,
        employee: employee || null,
      });
    } catch {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  },
);

export default router;
