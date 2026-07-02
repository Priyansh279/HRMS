import type { Types } from "mongoose";

type ObjectId = Types.ObjectId;

export type UserRole = "employee" | "admin";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmployee {
  _id: string | ObjectId;
  userId: string | ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  joinDate: Date;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive" | "on-leave";
  createdAt: Date;
  updatedAt: Date;
}

export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "sick" | "casual" | "annual" | "unpaid" | "other";

export interface ILeaveRequest {
  _id: string | ObjectId;
  employeeId: string | ObjectId;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string | ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  _id: string | ObjectId;
  employeeId: string | ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: "present" | "absent" | "half-day" | "leave" | "holiday";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  employeeId?: string;
}

export interface IExitApplication {
  _id: string;
  employeeId: string | ObjectId;
  reason: string;
  lastWorkingDay: Date;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string | ObjectId;
  approvedAt?: Date;
}

export type NoticeType = "announcement" | "holiday" | "reminder";

export interface INotice {
  _id: string;
  title: string;
  description: string;
  type: NoticeType;
  publishDate: Date;
  expiryDate?: Date;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SalaryStatus = "paid" | "unpaid";

export interface ISalary {
  employeeId: string | ObjectId;
  month: string;
  year: number;
  basic: number;
  hra: number;
  allowances: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: SalaryStatus;
  paidAt?: Date;
}

export interface ISalaryStructure {
  employeeId: string | ObjectId;
  basic: number;
  hra: number;
  allowances: number;
  bonus: number;
  deductions: number;
}
