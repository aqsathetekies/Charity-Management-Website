import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import InputField from '../components/InputField';
import GlowButton from '../components/GlowButton';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineLocationMarker } from 'react-icons/hi';

const BASE_URL = 'http://76.13.40.170:8001';

export default function SignIn() {
  const { login, isLoading, apiError, clearError } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [role, setRole] = useState('donor');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});

  // Hardcoded list of top 20 main cities in Pakistan
  useEffect(() => {
    setLocations([
      { id: 1, name: 'Islamabad' },
      { id: 2, name: 'Karachi' },
      { id: 3, name: 'Lahore' },
      { id: 4, name: 'Rawalpindi' },
      { id: 5, name: 'Peshawar' },
      { id: 6, name: 'Quetta' },
      { id: 7, name: 'Multan' },
      { id: 8, name: 'Faisalabad' },
      { id: 9, name: 'Sialkot' },
      { id: 10, name: 'Gujranwala' },
      { id: 11, name: 'Hyderabad' },
      { id: 12, name: 'Abbottabad' },
      { id: 13, name: 'Bahawalpur' },
      { id: 14, name: 'Sargodha' },
      { id: 15, name: 'Sukkur' },
      { id: 16, name: 'Larkana' },
      { id: 17, name: 'Sheikhupura' },
      { id: 18, name: 'Jhang' },
      { id: 19, name: 'Gujrat' },
      { id: 20, name: 'Mardan' },
    ]);
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.password) errs.password = 'Password is required';
    if (role === 'donor' && locations.length > 0 && !locationId) {
      errs.locationId = 'Please select a location';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const user = await login(form.username, form.password, role, locationId);
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/donate');
      }
    } catch {
      // apiError is set in context and displayed below
    }
  };

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    clearError();
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">💎</div>
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your CharityFund account</p>

        <form onSubmit={handleSubmit}>
          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              type="button"
              className={role === 'donor' ? 'active' : ''}
              onClick={() => { setRole('donor'); clearError(); }}
            >
              Donor
            </button>
            <button
              type="button"
              className={role === 'admin' ? 'active' : ''}
              onClick={() => { setRole('admin'); clearError(); setLocationId(''); }}
            >
              Admin
            </button>
          </div>

          {apiError && (
            <div
              style={{
                color: '#ff6b6b',
                background: 'rgba(255,107,107,0.1)',
                border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: '0.875rem',
              }}
            >
              ⚠️ {apiError}
            </div>
          )}

          <InputField
            label="Username"
            type="text"
            value={form.username}
            onChange={update('username')}
            icon={<HiOutlineUser />}
            error={errors.username}
            placeholder="Enter your username"
            required
          />

          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={update('password')}
            icon={<HiOutlineLockClosed />}
            error={errors.password}
            placeholder="Enter your password"
            required
          />

          {/* Location Dropdown - Only for Donors */}
          {role === 'donor' && locations.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                <HiOutlineLocationMarker style={{ fontSize: '1rem' }} />
                Login Location <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  if (errors.locationId) setErrors((prev) => ({ ...prev, locationId: '' }));
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${errors.locationId ? 'rgba(255,107,107,0.5)' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  padding: '11px 14px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                <option value="" style={{ color: 'black' }}>-- Select location --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id} style={{ color: 'black' }}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.locationId && (
                <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>⚠️</span> {errors.locationId}
                </div>
              )}
            </div>
          )}

          <GlowButton type="submit" fullWidth loading={isLoading}>
            Sign In
          </GlowButton>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
