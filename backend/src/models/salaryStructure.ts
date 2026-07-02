import mongoose, { Schema, Document, Model } from "mongoose";
import { ISalaryStructure } from "../types";

export interface ISalaryStructureDocument
  extends Omit<ISalaryStructure, "_id">, Document {}

const salaryStructureSchema = new Schema<ISalaryStructureDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    basic: { type: Number, required: true },
    hra: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One structure per employee
salaryStructureSchema.index({ employeeId: 1 }, { unique: true });

export const SalaryStructure: Model<ISalaryStructureDocument> =
  mongoose.model<ISalaryStructureDocument>(
    "SalaryStructure",
    salaryStructureSchema,
  );
