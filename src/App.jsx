import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import OpenAccessResources from './pages/OpenAccessResources';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import BrowseBooks from './pages/student/BrowseBooks';
import BookDetails from './pages/student/BookDetails';
import MyBorrows from './pages/student/MyBorrows';
import MyNotes from './pages/student/MyNotes';
import Fines from './pages/student/Fines';
import MyProfile from './pages/student/MyProfile';
import Analytics from './pages/student/Analytics';
import Resources from './pages/student/Resources';
import UploadMaterials from './pages/teacher/UploadMaterials';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCategories from './pages/admin/ManageCategories';
import IssuedBooks from './pages/admin/IssuedBooks';
import ManageFines from './pages/admin/ManageFines';
import ManageNotes from './pages/admin/ManageNotes';
import ManageNotices from './pages/admin/ManageNotices';
import Reports from './pages/admin/Reports';
import ManageResources from './pages/admin/ManageResources';

function RootEntry() {
  const { loading, isAuthenticated, isAdmin, isTeacher } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to={isTeacher ? '/teacher' : '/student'} replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RootEntry />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/open-access-resources" element={<OpenAccessResources />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/books"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <BrowseBooks />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/books/:id"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <BookDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/my-borrows"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <MyBorrows />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/fines"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <Fines />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/analytics"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/my-notes"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <MyNotes />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/resources"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <Resources />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <PrivateRoute role={['student', 'teacher']}>
                <MyProfile />
              </PrivateRoute>
            }
          />

          {/* Teacher routes (inherits student modules + upload materials) */}
          <Route
            path="/teacher"
            element={
              <PrivateRoute role="teacher">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/books"
            element={
              <PrivateRoute role="teacher">
                <BrowseBooks />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/books/:id"
            element={
              <PrivateRoute role="teacher">
                <BookDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/my-borrows"
            element={
              <PrivateRoute role="teacher">
                <MyBorrows />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/fines"
            element={
              <PrivateRoute role="teacher">
                <Fines />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/resources"
            element={
              <PrivateRoute role="teacher">
                <Resources />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/upload-materials"
            element={
              <PrivateRoute role="teacher">
                <UploadMaterials />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/analytics"
            element={
              <PrivateRoute role="teacher">
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/my-notes"
            element={
              <PrivateRoute role="teacher">
                <MyNotes />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/profile"
            element={
              <PrivateRoute role="teacher">
                <MyProfile />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <PrivateRoute role="admin">
                <ManageBooks />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute role="admin">
                <ManageUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute role="admin">
                <ManageCategories />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/issued-books"
            element={
              <PrivateRoute role="admin">
                <IssuedBooks />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/fines"
            element={
              <PrivateRoute role="admin">
                <ManageFines />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/notes"
            element={
              <PrivateRoute role="admin">
                <ManageNotes />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <PrivateRoute role="admin">
                <ManageNotices />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <PrivateRoute role="admin">
                <ManageResources />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute role="admin">
                <Reports />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
