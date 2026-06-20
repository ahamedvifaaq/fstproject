
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
// Route guards are tiny and used on most routes — keep them eager
import ProtectedRoute from "./components/protectedroutes";
import PublicRoute from "./components/PublicRoute";

// Lazy-load pages so heavy deps (Monaco editor, xterm) only download when the
// page that needs them is actually visited — keeps first load fast.
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Courses = lazy(() => import('./pages/Courses'));
const Modules = lazy(() => import('./pages/Modules'));
const Profile = lazy(() => import('./pages/Profile'));
const Addcourse = lazy(() => import('./pages/Addcourse'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const InstructorAnalytics = lazy(() => import('./pages/InstructorAnalytics'));
const GoogleCallback = lazy(() => import('./components/GoogleCallback'));
// Editor-heavy pages (pull in Monaco + xterm)
const Lesson = lazy(() => import('./Lesson'));
const Createlesson = lazy(() => import('./createlesson'));

// Reset scroll to the top whenever the route changes so pages don't open
// at the scroll offset carried over from the previous page.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#a855f7', fontFamily: 'sans-serif' }}>
      Loading…
    </div>
  );
}

function App() {

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>
    </>
  )
}
export default App
