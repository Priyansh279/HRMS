import mongoose, { Schema, Document, Model } from "mongoose";
import { INotice } from "../types";

export interface INoticeDocument
  extends Omit<INotice, "_id">, Document {}

const noticeSchema = new Schema<INoticeDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["announcement", "holiday", "reminder"],
      required: true,
    },

    publishDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
    },

    createdBy: {
      type: Schema.Types.String,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Notice: Model<INoticeDocument> =
  mongoose.model<INoticeDocument>(
    "Notice",
    noticeSchema
  );