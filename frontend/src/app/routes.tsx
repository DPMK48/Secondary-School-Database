import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout';
import { ProtectedRoute, RoleGuard } from '../guards';
import { Login } from '../features/auth';
import { Dashboard } from '../features/dashboard';
import { StudentList, StudentDetail } from '../features/students';
import { TeacherList, TeacherDetail, AssignSubjects } from '../features/teachers';
import { ClassList, ClassStudents } from '../features/classes';
import { SubjectList } from '../features/subjects';
import { ScoreEntry, ResultSummary, ResultApproval, ResultsHub } from '../features/results';
import { AttendanceEntry, AttendanceView, AttendanceHub } from '../features/attendance';
import { StudentReport, ClassReport, ReportsHub } from '../features/reports';
import { Profile } from '../features/profile';
import { Settings } from '../features/settings';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Home */}
        <Route index element={<Dashboard />} />

        {/* Students */}
        <Route
          path="students"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher', 'subject_teacher']}>
              <StudentList />
            </RoleGuard>
          }
        />
        <Route
          path="students/:id"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher', 'subject_teacher']}>
              <StudentDetail />
            </RoleGuard>
          }
        />

        {/* Teachers */}
        <Route
          path="teachers"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <TeacherList />
            </RoleGuard>
          }
        />
        <Route
          path="teachers/:id"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <TeacherDetail />
            </RoleGuard>
          }
        />
        <Route
          path="teachers/:id/assign"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AssignSubjects />
            </RoleGuard>
          }
        />

        {/* Classes */}
        <Route
          path="classes"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher']}>
              <ClassList />
            </RoleGuard>
          }
        />
        <Route
          path="classes/:id"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher']}>
              <ClassStudents />
            </RoleGuard>
          }
        />

        {/* Subjects */}
        <Route
          path="subjects"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <SubjectList />
            </RoleGuard>
          }
        />

        {/* Results */}
        <Route path="results" element={<ResultsHub />} />
        <Route
          path="results/entry"
          element={
            <RoleGuard allowedRoles={['admin', 'subject_teacher', 'form_teacher']}>
              <ScoreEntry />
            </RoleGuard>
          }
        />
        <Route
          path="results/summary"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher']}>
              <ResultSummary />
            </RoleGuard>
          }
        />
        <Route
          path="results/approval"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher']}>
              <ResultApproval />
            </RoleGuard>
          }
        />

        {/* Attendance */}
        <Route
          path="attendance"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher']}>
              <AttendanceHub />
            </RoleGuard>
          }
        />
        <Route
          path="attendance/entry"
          element={
            <RoleGuard allowedRoles={['form_teacher']}>
              <AttendanceEntry />
            </RoleGuard>
          }
        />
        <Route
          path="attendance/view"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher']}>
              <AttendanceView />
            </RoleGuard>
          }
        />

        {/* Reports */}
        <Route path="reports" element={<ReportsHub />} />
        <Route
          path="reports/student"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher']}>
              <StudentReport />
            </RoleGuard>
          }
        />
        <Route
          path="reports/class"
          element={
            <RoleGuard allowedRoles={['admin', 'form_teacher']}>
              <ClassReport />
            </RoleGuard>
          }
        />

        {/* Profile & Settings */}
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
