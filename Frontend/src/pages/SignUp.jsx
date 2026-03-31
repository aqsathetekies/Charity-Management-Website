import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import InputField from '../components/InputField';
import GlowButton from '../components/GlowButton';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineLocationMarker } from 'react-icons/hi';

const BASE_URL = 'http://76.13.40.170:8001';

export default function SignUp() {
  const { signup, isLoading, apiError, clearError } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    locationId: '',
  });
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});

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
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.includes(' ')) errs.username = 'Username cannot contain spaces';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters required';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    
    if (form.role === 'donor' && locations.length > 0 && !form.locationId) {
      errs.locationId = 'Please select a location';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const user = await signup(form.fullName, form.username, form.password, form.role, form.locationId);
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
        <h1>Create Account</h1>
        <p className="subtitle">Join CharityFund and make a difference</p>

        <form onSubmit={handleSubmit}>
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

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              type="button"
              className={form.role === 'donor' ? 'active' : ''}
              onClick={() => { setForm((f) => ({ ...f, role: 'donor' })); clearError(); }}
            >
              Donor
            </button>
            <button
              type="button"
              className={form.role === 'admin' ? 'active' : ''}
              onClick={() => { setForm((f) => ({ ...f, role: 'admin', locationId: '' })); clearError(); }}
            >
              Admin
            </button>
          </div>

          <InputField
            label="Full Name"
            value={form.fullName}
            onChange={update('fullName')}
            icon={<HiOutlineUser />}
            placeholder="Your display name"
            error={errors.fullName}
            required
          />

          <InputField
            label="Username"
            value={form.username}
            onChange={update('username')}
            icon={<HiOutlineUser />}
            placeholder="Choose a username (no spaces)"
            error={errors.username}
            required
          />

          <div className="form-row">
            <InputField
              label="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              icon={<HiOutlineLockClosed />}
              placeholder="Min 6 characters"
              error={errors.password}
              required
            />
            <InputField
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              icon={<HiOutlineLockClosed />}
              placeholder="Repeat password"
              error={errors.confirmPassword}
              required
            />
          </div>

          {/* Location Dropdown - Only for Donors */}
          {form.role === 'donor' && locations.length > 0 && (
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
                Registration Location <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <select
                value={form.locationId}
                onChange={update('locationId')}
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
            Sign Up
          </GlowButton>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/signin">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
