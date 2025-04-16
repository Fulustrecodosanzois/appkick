import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="nav">
      <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        Dashboard
      </NavLink>
      <NavLink to="/stream" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        Configurações da Live
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        Gerenciar Chat
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        Estatísticas
      </NavLink>
      <NavLink to="/subscriptions" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        Assinaturas
      </NavLink>
      <NavLink to="/clips" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        Clipes
      </NavLink>
      
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
        {user && (
          <span style={{ marginRight: '15px' }}>
            Olá, {user.username}
          </span>
        )}
        <button onClick={logout} className="btn btn-secondary">
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Navigation;