import { Router, Request, Response } from 'express';
import { LeaveRequest } from '../models/LeaveRequest';
import { Employee } from '../models/Employee';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user!.role === 'admin') {
      const leaves = await LeaveRequest.find()
        .populate('employeeId', 'firstName lastName employeeId department')
        .sort({ createdAt: -1 })
        .lean();
      res.json(leaves);
      return;
    }
    const employee = await Employee.findOne({ userId: req.user!.userId });
    if (!employee) {
      res.json([]);
      return;
    }
    const leaves = await LeaveRequest.find({ employeeId: employee._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leave requests', error: (err as Error).message });
  }
});

router.post('/', authenticate, requireRole('employee'), async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findOne({ userId: req.user!.userId });
    if (!employee) {
      res.status(404).json({ message: 'Employee profile not found' });
      return;
    }
    const leave = await LeaveRequest.create({
      employeeId: employee._id,
      ...req.body,
    });
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create leave request', error: (err as Error).message });
  }
});

router.patch('/:id/approve', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user!.userId, approvedAt: new Date() },
      { new: true }
    ).lean();
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve leave', error: (err as Error).message });
  }
});

router.patch('/:id/reject', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', approvedBy: req.user!.userId, approvedAt: new Date() },
      { new: true }
    ).lean();
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject leave', error: (err as Error).message });
  }
});

export default router;
