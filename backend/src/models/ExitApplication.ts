import mongoose, { Schema, Document, Model } from "mongoose";
import { IExitApplication } from "../types";

export interface IExitApplicationDocument
  extends Omit<IExitApplication, "_id">, Document {}

const exitApplicationSchema = new Schema<IExitApplicationDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    lastWorkingDay: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const ExitApplication: Model<IExitApplicationDocument> =
  mongoose.model<IExitApplicationDocument>(
    "ExitApplication",
    exitApplicationSchema,
  );
