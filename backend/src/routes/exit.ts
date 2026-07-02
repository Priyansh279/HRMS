import { Router, Request, Response } from "express";
import { ExitApplication } from "../models/ExitApplication";
import { Employee } from "../models/Employee";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

/* Get Exit Applications */

router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.user!.role === "admin") {
        const exits = await ExitApplication.find()
          .populate("employeeId", "firstName lastName")
          .sort({ createdAt: -1 })
          .lean();

        res.json(exits);
        return;
      }

      const employee = await Employee.findOne({ userId: req.user!.userId });

      if (!employee) {
        res.json([]);
        return;
      }

      const exits = await ExitApplication.find({ employeeId: employee._id })
        .sort({ createdAt: -1 })
        .lean();

      res.json(exits);
    } catch (err) {
      res.status(500).json({
        message: "Failed to fetch exit applications",
        error: (err as Error).message,
      });
    }
  },
);

/* Submit Exit Application */

router.post(
  "/apply",
  authenticate,
  requireRole("employee"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await Employee.findOne({ userId: req.user!.userId });

      if (!employee) {
        res.status(404).json({ message: "Employee profile not found" });
        return;
      }

      const { reason, lastWorkingDay } = req.body;

      const exit = await ExitApplication.create({
        employeeId: employee._id,
        reason,
        lastWorkingDay,
        status: "pending",
      });

      res.json(exit);
    } catch (err) {
      res.status(500).json({
        message: "Failed to submit exit application",
        error: (err as Error).message,
      });
    }
  },
);

/* Approve / Reject Exit Application */

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.body;

      const updated = await ExitApplication.findByIdAndUpdate(
        req.params.id,
        {
          status,
          approvedBy: req.user!.userId,
          approvedAt: new Date(),
        },
        { new: true },
      ).lean();

      if (!updated) {
        res.status(404).json({ message: "Exit request not found" });
        return;
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({
        message: "Failed to update exit status",
        error: (err as Error).message,
      });
    }
  },
);

export default router;
