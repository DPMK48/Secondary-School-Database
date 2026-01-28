import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout';
import { ProtectedRoute, RoleGuard } from '../guards';
import { Login } from '../features/auth';
import { Dashboard } from '../features/dashboard';
import { StudentList, StudentDetail } from '../features/students';
import { TeacherList, TeacherDetail, AssignSubjects } from '../features/teachers';
import { ClassRouter, ClassStudents } from '../features/classes';
import { SubjectList, MySubjects } from '../features/subjects';
import { ScoreEntry, ResultSummary, ResultApproval, ResultsHub, SubjectTeacherScoreEntry, FormTeacherResultCompilation } from '../features/results';
import { AttendanceEntry, AttendanceView, AttendanceRouter } from '../features/attendance';
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
            <RoleGuard allowedRoles={['Admin', 'Form Teacher', 'Subject Teacher']}>
              <StudentList />
            </RoleGuard>
          }
        />
        <Route
          path="students/:id"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher', 'Subject Teacher']}>
              <StudentDetail />
            </RoleGuard>
          }
        />

        {/* Teachers */}
        <Route
          path="teachers"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <TeacherList />
            </RoleGuard>
          }
        />
        <Route
          path="teachers/:id"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <TeacherDetail />
            </RoleGuard>
          }
        />
        <Route
          path="teachers/:id/assign"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <AssignSubjects />
            </RoleGuard>
          }
        />

        {/* Classes */}
        <Route
          path="classes"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher', 'Subject Teacher']}>
              <ClassRouter />
            </RoleGuard>
          }
        />
        <Route
          path="classes/:id"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher', 'Subject Teacher']}>
              <ClassStudents />
            </RoleGuard>
          }
        />

        {/* Subjects */}
        <Route
          path="subjects"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <SubjectList />
            </RoleGuard>
          }
        />
        <Route
          path="my-subjects"
          element={
            <RoleGuard allowedRoles={['Subject Teacher', 'Form Teacher']}>
              <MySubjects />
            </RoleGuard>
          }
        />

        {/* Results */}
        <Route path="results" element={<ResultsHub />} />
        <Route
          path="results/entry"
          element={
            <RoleGuard allowedRoles={['Admin', 'Subject Teacher', 'Form Teacher']}>
              <ScoreEntry />
            </RoleGuard>
          }
        />
        <Route
          path="results/subject-teacher-entry"
          element={
            <RoleGuard allowedRoles={['Subject Teacher']}>
              <SubjectTeacherScoreEntry />
            </RoleGuard>
          }
        />
        <Route
          path="results/form-teacher-compilation"
          element={
            <RoleGuard allowedRoles={['Form Teacher', 'Admin']}>
              <FormTeacherResultCompilation />
            </RoleGuard>
          }
        />
        <Route
          path="results/summary"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher']}>
              <ResultSummary />
            </RoleGuard>
          }
        />
        <Route
          path="results/approval"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher']}>
              <ResultApproval />
            </RoleGuard>
          }
        />

        {/* Attendance */}
        <Route
          path="attendance"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher']}>
              <AttendanceRouter />
            </RoleGuard>
          }
        />
        <Route
          path="attendance/entry"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher']}>
              <AttendanceEntry />
            </RoleGuard>
          }
        />
        <Route
          path="attendance/view"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher']}>
              <AttendanceView />
            </RoleGuard>
          }
        />

        {/* Reports */}
        <Route path="reports" element={<ReportsHub />} />
        <Route
          path="reports/student"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher']}>
              <StudentReport />
            </RoleGuard>
          }
        />
        <Route
          path="reports/class"
          element={
            <RoleGuard allowedRoles={['Admin', 'Form Teacher']}>
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
