import { Router, Request, Response } from "express";
import { Employee } from "../models/Employee";
import { User } from "../models/User";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employees = await Employee.find()
        .populate("userId", "email")
        .lean();
      res.json(employees);
    } catch (err) {
      res
        .status(500)
        .json({
          message: "Failed to fetch employees",
          error: (err as Error).message,
        });
    }
  },
);

router.get(
  "/me",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await Employee.findOne({
        userId: req.user!.userId,
      }).lean();
      if (!employee) {
        res.status(404).json({ message: "Employee profile not found" });
        return;
      }
      res.json(employee);
    } catch (err) {
      res
        .status(500)
        .json({
          message: "Failed to fetch profile",
          error: (err as Error).message,
        });
    }
  },
);

router.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await Employee.findById(req.params.id)
        .populate("userId", "email")
        .lean();
      if (!employee) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }
      if (
        req.user!.role === "employee" &&
        req.user!.employeeId !== employee._id?.toString()
      ) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      res.json(employee);
    } catch (err) {
      res
        .status(500)
        .json({
          message: "Failed to fetch employee",
          error: (err as Error).message,
        });
    }
  },
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { bankName, accountNumber, ifscCode, accountHolderName, ...rest } =
        req.body;

      const updated = await Employee.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...rest,
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
          },
        },
        { new: true },
      ).lean();
      if (!updated) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      res
        .status(500)
        .json({
          message: "Failed to update employee",
          error: (err as Error).message,
        });
    }
  },
);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email,
        password,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        ...emp
      } = req.body;
        
           const existingUser = await User.findOne({ email });
      if (existingUser) {
        res
          .status(400)
          .json({ message: "User with this email already exists" });
        return;
      }
      const user = await User.create({
        email,
        password: password || "ChangeMe123!",
        role: "employee",
        employeeId: emp.employeeId,
      });
      const employee = await Employee.create({
        userId: user._id,
        ...emp,
        email,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
      });
      res.status(201).json(employee);
    } catch (err) {
      res
        .status(500)
        .json({
          message: "Failed to create employee",
          error: (err as Error).message,
        });
    }
  },
);

export default router;
