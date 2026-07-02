import { Router, Request, Response } from "express";
import type { IAttendance } from "../types";
import { Attendance } from "../models/Attendance";
import { Employee } from "../models/Employee";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

const calculateStatus = (
  checkIn?: Date,
  checkOut?: Date,
): "present" | "absent" | "half-day" => {
  if (!checkIn || !checkOut) return "absent";

  const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  console.log("Working Hours:", diffHours);

  if (diffHours >= 8) return "present";
  if (diffHours >= 4) return "half-day";
  return "absent";
};
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, from, to } = req.query;
      if (req.user!.role === "admin" && employeeId) {
        const attendance = await Attendance.find({
          employeeId,
          ...(from && to
            ? {
                date: {
                  $gte: new Date(from as string),
                  $lte: new Date(to as string),
                },
              }
            : {}),
        })
          .sort({ date: -1 })
          .lean();
        res.json(attendance);
        return;
      }
      const employee = await Employee.findOne({ userId: req.user!.userId });
      if (!employee) {
        res.json([]);
        return;
      }
      const attendance = await Attendance.find({
        employeeId: employee._id,
        ...(from && to
          ? {
              date: {
                $gte: new Date(from as string),
                $lte: new Date(to as string),
              },
            }
          : {}),
      })
        .sort({ date: -1 })
        .lean();
      res.json(attendance);
    } catch (err) {
      res.status(500).json({
        message: "Failed to fetch attendance",
        error: (err as Error).message,
      });
    }
  },
);

router.post(
  "/check-in",
  authenticate,
  requireRole("employee"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await Employee.findOne({ userId: req.user!.userId });
      if (!employee) {
        res.status(404).json({ message: "Employee profile not found" });
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let record = await Attendance.findOne({
        employeeId: employee._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });
      if (record) {
        record.checkIn = record.checkIn || new Date();
        await record.save();
      } else {
        record = await Attendance.create({
          employeeId: employee._id,
          date: today,
          checkIn: new Date(),
          status: "present",
        });
      }
      res.json(record);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to check in", error: (err as Error).message });
    }
  },
);

router.post(
  "/check-out",
  authenticate,
  requireRole("employee"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await Employee.findOne({ userId: req.user!.userId });
      if (!employee) {
        res.status(404).json({ message: "Employee profile not found" });
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const record = await Attendance.findOne({
        employeeId: employee._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });
      if (!record) {
        res.status(400).json({ message: "No check-in found for today" });
        return;
      }
      record.checkOut = new Date();

      record.status = calculateStatus(record.checkIn, record.checkOut);

      await record.save();
      res.json(record);
    } catch (err) {
      res.status(500).json({
        message: "Failed to check out",
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
      const updated = await Attendance.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true },
      ).lean();
      if (!updated) {
        res.status(404).json({ message: "Attendance record not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({
        message: "Failed to update attendance",
        error: (err as Error).message,
      });
    }
  },
);

export default router;
