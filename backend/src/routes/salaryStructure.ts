import { Router, Request, Response } from "express";
import { SalaryStructure } from "../models/salaryStructure";
import { Employee } from "../models/Employee";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();


// 🔹 GET all salary structures
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.query;

      // 👉 Admin can see all or filter by employee
      if (req.user!.role === "admin") {
        const data = await SalaryStructure.find(
          employeeId ? { employeeId } : {}
        )
          .populate("employeeId") // 🔥 IMPORTANT FIX
          .sort({ createdAt: -1 })
          .lean();

        res.json(data);
        return;
      }

      // 👉 Employee can see only their own
      const employee = await Employee.findOne({
        userId: req.user!.userId,
      });

      if (!employee) {
        res.json([]);
        return;
      }

      const data = await SalaryStructure.find({
        employeeId: employee._id,
      })
        .populate("employeeId") // 🔥 IMPORTANT
        .sort({ createdAt: -1 })
        .lean();

      res.json(data);
    } catch (err) {
      res.status(500).json({
        message: "Failed to fetch salary structure",
        error: (err as Error).message,
      });
    }
  }
);


// 🔹 CREATE salary structure (ADMIN ONLY)
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        basic,
        hra,
        allowances,
        bonus,
        deductions,
      } = req.body;

      // 🔥 Validate employee exists
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }

      const newStructure = await SalaryStructure.create({
        employeeId,
        basic,
        hra,
        allowances,
        bonus,
        deductions,
      });

      res.json(newStructure);
    } catch (err) {
      res.status(400).json({
        message: "Failed to create salary structure",
        error: (err as Error).message,
      });
    }
  }
);


// 🔹 UPDATE salary structure
router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await SalaryStructure.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      )
        .populate("employeeId")
        .lean();

      if (!updated) {
        res.status(404).json({ message: "Salary structure not found" });
        return;
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({
        message: "Failed to update salary structure",
        error: (err as Error).message,
      });
    }
  }
);


// 🔹 DELETE salary structure (optional)
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await SalaryStructure.findByIdAndDelete(req.params.id);

      if (!deleted) {
        res.status(404).json({ message: "Salary structure not found" });
        return;
      }

      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({
        message: "Failed to delete salary structure",
        error: (err as Error).message,
      });
    }
  }
);

export default router;