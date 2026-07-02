import mongoose, { Schema, Document, Model } from 'mongoose';
import { ILeaveRequest, LeaveStatus, LeaveType } from '../types';

export interface ILeaveRequestDocument extends Omit<ILeaveRequest, '_id'>, Document {}

const leaveRequestSchema = new Schema<ILeaveRequestDocument>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['sick', 'casual', 'annual', 'unpaid', 'other'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export const LeaveRequest: Model<ILeaveRequestDocument> = mongoose.model<ILeaveRequestDocument>(
  'LeaveRequest',
  leaveRequestSchema
);
