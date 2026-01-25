import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, setView, logout } = useContext(AuthContext);
  return (
    <header className="header">
      <div className="header-inner container">
        <div className="brand" onClick={() => setView(user ? 'dashboard' : 'login')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo" />
          <div className="brand-title">Study Pilot</div>
        </div>
        <div>
          {user ? (
            <>
              <button className="button" onClick={() => setView('myplans')} style={{ marginRight: 8 }}>My Plans</button>
              <button className="button button-secondary" onClick={() => setView('wizard')} style={{ marginRight: 8 }}>New Plan</button>
              <button className="button button-danger" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <button className="button button-primary" onClick={() => setView('signup')} style={{ marginRight: 8 }}>Sign up</button>
              <button className="button button-secondary" onClick={() => setView('login')}>Log in</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
