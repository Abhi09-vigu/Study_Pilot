import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PlanWizard from './pages/PlanWizard.jsx';
import MyPlans from './pages/MyPlans.jsx';
import Header from './components/Header.jsx';

function AppInner() {
  const { user, view, setView } = useContext(AuthContext);
  return (
    <>
      <Header />
      <div className="container">
        {!user ? (
          view === 'login' ? <Login /> : <Signup />
        ) : view === 'wizard' ? (
          <PlanWizard />
        ) : view === 'myplans' ? (
          <MyPlans />
        ) : (
          <Dashboard onStartPlan={() => setView('wizard')} />
        )}
      </div>
      <footer className="footer">Gentle progress beats perfection. 🌿</footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
