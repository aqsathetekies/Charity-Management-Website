import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import GlowButton from '../components/GlowButton';
import {
  HiOutlineHeart,
  HiOutlineBadgeCheck,
  HiOutlineLocationMarker,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import { BsCurrencyRupee } from 'react-icons/bs';

// Live backend base URL
const BASE_URL = 'http://76.13.40.170:8001';

export default function Donation() {
  const { currentUser, addDonation, isLoading, apiError, clearError } = useApp();

  const [amount, setAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [locationId, setLocationId] = useState(currentUser?.locationId || '');
  const [screenshot, setScreenshot] = useState(null);
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

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
    if (!amount || isNaN(amount)) errs.amount = 'Enter a valid amount';
    else if (parseFloat(amount) <= 0) errs.amount = 'Amount must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      // addDonation(amount, donorName, isAnonymous, locationId, screenshotFile)
      // → POST /donate  multipart/form-data
      await addDonation(
        amount,
        currentUser?.fullName || currentUser?.username || 'User',
        anonymous,
        locationId ? parseInt(locationId, 10) : null,
        screenshot || null
      );
      setSuccess(true);
      setAmount('');
      setAnonymous(false);
      setLocationId('');
      setScreenshot(null);
      // Reset file input
      const fileInput = document.getElementById('donation-screenshot');
      if (fileInput) fileInput.value = '';
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      // apiError is set in context and displayed below
    }
  };

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h1>Make a Donation</h1>
        <p>Your contribution makes a real difference in people's lives</p>
      </div>

      <div className="donation-container">
        {success && (
          <div className="success-message" style={{ marginBottom: 24 }}>
            <div className="icon"><HiOutlineBadgeCheck /></div>
            <h3>Thank You!</h3>
            <p>
              Your donation has been received and is pending verification by our team.
              Together we're making the world a better place.
            </p>
          </div>
        )}

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

        <GlassCard>
          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <InputField
              label="Donation Amount (₨)"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                clearError();
                if (errors.amount) setErrors({});
              }}
              icon={<BsCurrencyRupee />}
              placeholder="e.g. 100"
              error={errors.amount}
              min="0"
              step="0.01"
              required
            />

            {/* Location Dropdown — only shown when locations are available */}
            {locations.length > 0 && (
              <div style={{ marginBottom: 16 }}>
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
                  Location <span style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</span>
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    padding: '11px 14px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  <option value="" style={{ color: 'black' }}>-- Select branch / location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} style={{ color: 'black' }}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Screenshot Upload */}
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
                <HiOutlinePhotograph style={{ fontSize: '1rem' }} />
                Payment Screenshot <span style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="donation-screenshot"
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0] || null)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  color: 'var(--text-secondary)',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              />
              {screenshot && (
                <p style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: 6 }}>
                  ✓ Selected: {screenshot.name}
                </p>
              )}
            </div>

            {/* Anonymous Toggle */}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="donationType"
                  checked={!anonymous}
                  onChange={() => setAnonymous(false)}
                />
                <span>
                  Show my name ({currentUser?.fullName || currentUser?.username || 'User'})
                </span>
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="donationType"
                  checked={anonymous}
                  onChange={() => setAnonymous(true)}
                />
                <span>Donate Anonymously</span>
              </label>
            </div>

            <GlowButton type="submit" fullWidth loading={isLoading} icon={<HiOutlineHeart />}>
              Donate Now
            </GlowButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
