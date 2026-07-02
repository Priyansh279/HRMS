import mongoose, { Schema, Document, Model } from "mongoose";
import { ISalary, SalaryStatus } from "../types";

export interface ISalaryDocument extends Omit<ISalary, "_id">, Document {}

const salarySchema = new Schema<ISalaryDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    month: { type: String, required: true },
    year: { type: Number, required: true },

    basic: { type: Number, required: true },
    hra: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },

    netSalary: { type: Number, required: true },

    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    paidAt: { type: Date },
  },
  { timestamps: true },
);

salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export const Salary: Model<ISalaryDocument> = mongoose.model<ISalaryDocument>(
  "Salary",
  salarySchema,
);
