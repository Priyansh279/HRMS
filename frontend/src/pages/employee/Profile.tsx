import { useEffect, useState } from 'react';
import { employeesApi } from '../../api/client';
import type { Employee } from '../../types';
import './Profile.css';

export default function EmployeeProfile() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeesApi
      .me()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading profile...</div>;
  if (!profile) return <div className="page-loading">Profile not found.</div>;

  return (
    <div className="profile-page">
      <h1 className="page-title">My Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div>
            <h2>{profile.firstName} {profile.lastName}</h2>
            <p>{profile.designation} · {profile.department}</p>
            <p className="profile-id">ID: {profile.employeeId}</p>
          </div>
        </div>
        <dl className="profile-details">
          <dt>Email</dt>
          <dd>{profile.email}</dd>
          <dt>Department</dt>
          <dd>{profile.department}</dd>
          <dt>Designation</dt>
          <dd>{profile.designation}</dd>
          <dt>Bank Name</dt>
          <dd>{profile.bankName}</dd>
          <dt>Account Number</dt>
          <dd>{profile.accountNumber}</dd>
          <dt>IFSC CODE</dt>
          <dd>{profile.ifscCode}</dd>
          <dt>Account Holder Name</dt>
          <dd>{profile.accountHolderName}</dd>
          <dt>Join date</dt>
          <dd>{new Date(profile.joinDate).toLocaleDateString()}</dd>
          <dt>Status</dt>
          <dd><span className={`status-badge status-${profile.status}`}>{profile.status}</span></dd>
          {profile.phone && (
            <>
              <dt>Phone</dt>
              <dd>{profile.phone}</dd>
            </>
          )}
          {profile.address && (
            <>
              <dt>Address</dt>
              <dd>{profile.address}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
