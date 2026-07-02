export type UserRole = "employee" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;

  employee?: {
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
  } | null;
}

export interface Employee {
  _id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  joinDate: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive" | "on-leave";
  createdAt: string;
  updatedAt: string;
}

export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "sick" | "casual" | "annual" | "unpaid" | "other";

export interface LeaveRequest {
  _id: string;
  employeeId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
        department?: string;
      };
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus =
  | "present"
  | "absent"
  | "half-day"
  | "leave"
  | "holiday";

export interface Attendance {
  _id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}
export interface ExitApplication {
  _id: string;
  employeeId:
    | string
    | {
        firstName: string;
        lastName: string;
      };
  reason: string;
  lastWorkingDay: string;
  status: "pending" | "approved" | "rejected";
}

export type NoticeType = "announcement" | "holiday" | "reminder";

export interface Notice {
  _id: string;
  title: string;
  description: string;
  type: NoticeType;
  publishDate: string;
  expiryDate?: string;
  createdBy: string;
}

export interface Salary {
  _id: string;
  employeeId:| string | {
    firstName:String;
    lastName:String;
    employeedId?: String;
  };
  month: string;
  year: String;
  basic: String;
  hra: String;
  allowances: String;
  bonus: String;
  deductions: String;
  netSalary: String;
  status: "paid" | "unpaid";
  createdAt: string;
}
 export interface SalaryStructure {
  _id: string;
  employeeId: string | Employee;
  basic: String;
  hra: String;
  allowances: String;
  bonus: String;
  deductions: String;
}
