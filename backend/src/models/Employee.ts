import mongoose, { Schema, Document, Model } from 'mongoose';
import { IEmployee } from '../types';

export interface IEmployeeDocument extends Omit<IEmployee, '_id'>, Document {}

const employeeSchema = new Schema<IEmployeeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    joinDate: { type: Date, required: true },
    bankName: { type: String , required:true},
    accountNumber: { type: String ,required:true},
    ifscCode: { type: String, required:true },
    accountHolderName: { type: String , required:true},
    phone: { type: String },
    address: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  },
  { timestamps: true }
);

export const Employee: Model<IEmployeeDocument> = mongoose.model<IEmployeeDocument>(
  'Employee',
  employeeSchema
);
