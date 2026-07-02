import { Router, Request, Response } from "express";
import { Salary } from "../models/salary";
import { SalaryStructure } from "../models/salaryStructure";
import { Employee } from "../models/Employee";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// ✅ GET ALL / MY SALARY
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 🔹 Admin → see all salaries
      if (req.user!.role === "admin") {
        const salaries = await Salary.find()
          .populate("employeeId", "firstName lastName employeeId department")
          .sort({ createdAt: -1 })
          .lean();

        res.json(salaries);
        return;
      }

      // 🔹 Employee → see own salary
      const employee = await Employee.findOne({ userId: req.user!.userId });

      if (!employee) {
        res.json([]);
        return;
      }

      const salaries = await Salary.find({ employeeId: employee._id })
        .sort({ year: -1, month: -1 })
        .lean();

      res.json(salaries);
    } catch (err) {
      res.status(500).json({
        message: "Failed to fetch salaries",
        error: (err as Error).message,
      });
    }
  },
);

// ✅ GENERATE SALARY (ADMIN ONLY)
router.post(
  "/generate",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, month, year } = req.body;

      const structure = await SalaryStructure.findOne({ employeeId });

      if (!structure) {
        res.status(404).json({ message: "Salary structure not found" });
        return;
      }

      // 🔥 Prevent duplicate salary
      const existing = await Salary.findOne({ employeeId, month, year });
      if (existing) {
        res
          .status(400)
          .json({ message: "Salary already generated for this month" });
        return;
      }

      const netSalary =
        structure.basic +
        structure.hra +
        structure.allowances +
        structure.bonus -
        structure.deductions;

      const salary = await Salary.create({
        employeeId,
        month,
        year,
        basic: structure.basic,
        hra: structure.hra,
        allowances: structure.allowances,
        bonus: structure.bonus,
        deductions: structure.deductions,
        netSalary,
      });

      res.status(201).json({ message: "Salary generated", salary });
    } catch (err) {
      res.status(500).json({
        message: "Failed to generate salary",
        error: (err as Error).message,
      });
    }
  },
);

// ✅ GET SINGLE SALARY (FOR PDF / DETAILS)
router.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const salary = await Salary.findById(req.params.id)
        .populate("employeeId", "firstName lastName employeeId department")
        .lean();

      if (!salary) {
        res.status(404).json({ message: "Salary not found" });
        return;
      }

      // 🔒 Employee can only access own salary
      if (req.user!.role !== "admin") {
        const employee = await Employee.findOne({ userId: req.user!.userId });

        if (
          !employee ||
          salary.employeeId.toString() !== employee._id.toString()
        ) {
          res.status(403).json({ message: "Unauthorized access" });
          return;
        }
      }

      res.json(salary);
    } catch (err) {
      res.status(500).json({
        message: "Failed to fetch salary",
        error: (err as Error).message,
      });
    }
  },
);

// ✅ MARK AS PAID (ADMIN ONLY)
router.patch(
  "/:id/pay",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const salary = await Salary.findByIdAndUpdate(
        req.params.id,
        { status: "paid", paidAt: new Date() },
        { new: true },
      ).lean();

      if (!salary) {
        res.status(404).json({ message: "Salary not found" });
        return;
      }

      res.json(salary);
    } catch (err) {
      res.status(500).json({
        message: "Failed to update salary status",
        error: (err as Error).message,
      });
    }
  },
);

export default router;
