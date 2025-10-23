import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import PatientDashboard from './components/patient/PatientDashboard';
import CaregiverDashboard from './components/caregiver/CaregiverDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth />;
  }

  if (profile.role === 'patient') {
    return <PatientDashboard />;
  }

  if (profile.role === 'caregiver') {
    return <CaregiverDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">未知用户类型</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
