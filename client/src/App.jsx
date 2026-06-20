
import Lesson from './Lesson';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from "./pages/Profile";
import Modules from './pages/Modules';
import ProtectedRoute from "./components/protectedroutes";
import PublicRoute from "./components/PublicRoute";
import GoogleCallback from "./components/GoogleCallback";
import Addcourse from './pages/Addcourse';
import Editmodule from './pages/editmodule';
import Createlesson from './createlesson';
import AdminDashboard from './pages/AdminDashboard';
import InstructorAnalytics from './pages/InstructorAnalytics';

import Home from './pages/Home';

// Reset scroll to the top whenever the route changes so pages don't open
// at the scroll offset carried over from the previous page.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/google-callback" element={<GoogleCallback />} />
        <Route path="/addcourse/:id" element={<Addcourse />} />
        <Route path="/createlesson/:courseId/:moduleId/:title/:language" element={<Createlesson />} />

        {/* Protected routes - redirect to / (login) if not logged in */}
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/course/:courseId/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
        <Route path="/lesson/:lessonID/:mtitle" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><InstructorAnalytics /></ProtectedRoute>} />

        {/* Catch-all - redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
export default App
