import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import leaveRoutes from './routes/leave';
import attendanceRoutes from './routes/attendance';
import exitRoutes from './routes/exit'; 
import noticeRoutes from './routes/notices';
import salaryRoutes from "./routes/salary";
import SalaryStructure  from './routes/salaryStructure';


const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exits', exitRoutes);
app.use('/api/notices', noticeRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/salarystructure", SalaryStructure);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`HRMS API running on http://localhost:${PORT}`));
