
import Lesson from './Lesson';
import { Routes, Route, Navigate } from 'react-router-dom';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from "./pages/Profile";
import Modules from './pages/Modules';
import ProtectedRoute from "./components/protectedroutes";
import PublicRoute from "./components/PublicRoute";
import GoogleCallback from "./components/GoogleCallback";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/google-callback" element={<GoogleCallback />} />

        {/* Protected routes - redirect to / (login) if not logged in */}
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/course/:courseId/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
        <Route path="/lesson/:lessonID/:mtitle" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Catch-all - redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
export default App
