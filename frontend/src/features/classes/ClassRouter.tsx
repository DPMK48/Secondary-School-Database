import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ClassList from './ClassList';
import MyClass from './MyClass';

/**
 * ClassRouter Component
 * Routes to different class views based on user role:
 * - Admin: ClassList (all classes with management options)
 * - Form Teacher: MyClass (only their assigned class)
 */
const ClassRouter: React.FC = () => {
  const { user } = useAuth();

  // Form teachers only see their assigned class
  if (user?.role === 'Form Teacher') {
    return <MyClass />;
  }

  // Admin gets the full class list
  return <ClassList />;
};

export default ClassRouter;
