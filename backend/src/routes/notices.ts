import { Router, Request, Response } from 'express';
import { Notice } from '../models/Notice';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();

    const notices =
      req.user!.role === 'admin'
        ? await Notice.find().sort({ createdAt: -1 }).lean()
        : await Notice.find({
            publishDate: { $lte: today },
            $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: today } }],
          })
            .sort({ publishDate: -1 })
            .lean();

    res.json(notices);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch notices',
      error: (err as Error).message,
    });
  }
});

/**
 * CREATE notice (Admin only)
 */
router.post('/', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, type, publishDate, expiryDate } = req.body;

    const notice = await Notice.create({
      title,
      description,
      type,
      publishDate,
      expiryDate,
      createdBy: req.user!.userId,
    });

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to create notice',
      error: (err as Error).message,
    });
  }
});

/**
 * UPDATE notice (Admin)
 */
router.put('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to update notice',
      error: (err as Error).message,
    });
  }
});

/**
 * DELETE notice (Admin)
 */
router.delete('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);

    if (!deleted) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete notice',
      error: (err as Error).message,
    });
  }
});

export default router;