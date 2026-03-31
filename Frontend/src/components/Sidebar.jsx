import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  HiOutlineViewGrid,
  HiOutlineHeart,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { BsCurrencyRupee } from 'react-icons/bs';
import { useState } from 'react';
import './Sidebar.css';

const adminNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <HiOutlineViewGrid /> },
  { to: '/expenses', label: 'Expenses', icon: <BsCurrencyRupee /> },
  { to: '/history', label: 'History', icon: <HiOutlineClipboardList /> },
];

const donorNavItems = [
  { to: '/donate', label: 'Donate', icon: <HiOutlineHeart /> },
  { to: '/history', label: 'History', icon: <HiOutlineClipboardList /> },
];

export default function Sidebar() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = currentUser?.role === 'admin' ? adminNavItems : donorNavItems;

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button className="sidebar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <span className="sidebar__logo-icon">💎</span>
            <span className="sidebar__logo-text">CharityFund</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {currentUser?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{currentUser?.fullName || 'User'}</span>
              <span className="sidebar__user-role">{currentUser?.role || 'donor'}</span>
            </div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout}>
            <HiOutlineLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
