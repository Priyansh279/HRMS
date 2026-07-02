import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAttendance } from '../types';

export interface IAttendanceDocument extends Omit<IAttendance, '_id'>, Document {}

const attendanceSchema = new Schema<IAttendanceDocument>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'leave', 'holiday'],
      default: 'absent',
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendanceDocument> = mongoose.model<IAttendanceDocument>(
  'Attendance',
  attendanceSchema
);
