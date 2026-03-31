import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

// ─── Live Backend Base URL ────────────────────────────────────────────────────
const BASE_URL = 'http://76.13.40.170:8001';

// ─── Token Helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('cfms_token');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Normalize Donation from API shape → UI shape ─────────────────────────────
// API: { id, amount, donor_name, is_anonymous, is_verified, screenshot_url, location_id, location, created_at }
// UI:  { id, amount, name, anonymous, is_verified, screenshot_url, location_id, location, date, created_at }
const normalizeDonation = (d) => ({
  ...d,
  name: d.donor_name,
  anonymous: d.is_anonymous,
  date: d.created_at,
});

// ─── Normalize Expense from API shape → UI shape ─────────────────────────────
// API: { id, amount, description, created_at }
// UI:  { id, amount, description, date, created_at }
const normalizeExpense = (e) => ({
  ...e,
  date: e.created_at,
});

export function AppProvider({ children }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cfms_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalFunds, setTotalFunds] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Persist currentUser to localStorage on change
  useEffect(() => {
    localStorage.setItem('cfms_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // ── Clear error helper (pages can call this on input change) ───────────────
  const clearError = useCallback(() => setApiError(null), []);

  // ── GET /dashboard ─────────────────────────────────────────────────────────
  // Response: { totalFunds, totalExpenses, remainingBalance }
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard`);
      if (!res.ok) return;
      const data = await res.json();
      setTotalFunds(data.totalFunds ?? 0);
      setTotalExpenses(data.totalExpenses ?? 0);
      setBalance(data.remainingBalance ?? 0);
    } catch (e) {
      console.error('fetchDashboard error:', e);
    }
  }, []);

  // ── GET /admin/donations (admin) or GET /donations (donor/public) ──────────
  // DonationResponse: { id, amount, donor_name, is_anonymous, is_verified,
  //                     screenshot_url, location_id, location, created_at }
  const fetchDonations = useCallback(async (user) => {
    try {
      const token = getToken();
      if (user?.role === 'admin' && token) {
        // Admin: gets ALL donations including unverified
        const res = await fetch(`${BASE_URL}/admin/donations`, {
          headers: authHeader(),
        });
        if (!res.ok) return;
        const data = await res.json();
        setDonations(data.map(normalizeDonation));
      } else {
        // Public: only verified donations
        const res = await fetch(`${BASE_URL}/donations`);
        if (!res.ok) return;
        const data = await res.json();
        setDonations(data.map(normalizeDonation));
      }
    } catch (e) {
      console.error('fetchDonations error:', e);
    }
  }, []);

  // ── GET /expenses ──────────────────────────────────────────────────────────
  // ExpenseResponse: { id, amount, description, created_at }
  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/expenses`);
      if (!res.ok) return;
      const data = await res.json();
      setExpenses(data.map(normalizeExpense));
    } catch (e) {
      console.error('fetchExpenses error:', e);
    }
  }, []);

  // ── Reload all data whenever user session changes ──────────────────────────
  useEffect(() => {
    if (currentUser) {
      fetchDashboard();
      fetchDonations(currentUser);
      fetchExpenses();
    } else {
      setDonations([]);
      setExpenses([]);
      setTotalFunds(0);
      setTotalExpenses(0);
      setBalance(0);
    }
  }, [currentUser, fetchDashboard, fetchDonations, fetchExpenses]);

  // ── POST /register  { username, password } → UserCreate ───────────────────
  const signup = useCallback(async (fullName, username, password, role, locationId = null) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Step 1: Register account
      const regRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!regRes.ok) {
        const err = await regRes.json();
        throw new Error(err.detail || 'Registration failed');
      }

      // Step 2: Login immediately to obtain JWT token
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(err.detail || 'Auto-login after registration failed');
      }
      const tokenData = await loginRes.json();
      localStorage.setItem('cfms_token', tokenData.access_token);

      // Step 3: Build user object — role comes from UI selection
      const user = { id: username, fullName, username, role, locationId };
      setCurrentUser(user);
      return user;
    } catch (e) {
      setApiError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── POST /login  { username, password } form-urlencoded → { access_token, token_type } ──
  // role is explicitly passed from the SignIn page toggle (Donor / Admin).
  const login = useCallback(async (username, password, role = 'donor', locationId = null) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Invalid username or password');
      }

      const tokenData = await res.json();
      localStorage.setItem('cfms_token', tokenData.access_token);

      const user = { id: username, fullName: username, username, role, locationId };
      setCurrentUser(user);
      return user;
    } catch (e) {
      setApiError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('cfms_token');
    localStorage.removeItem('cfms_user');
    setCurrentUser(null);
    setApiError(null);
  }, []);

  // ── POST /donate  multipart/form-data ─────────────────────────────────────
  // Fields: amount (required), donor_name, is_anonymous, location_id, screenshot (file)
  // DonationResponse returned
  const addDonation = useCallback(async (amount, name, anonymous, locationId = null, screenshotFile = null) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append('amount', parseFloat(amount));
      formData.append('donor_name', anonymous ? 'Anonymous' : (name || 'Anonymous'));
      formData.append('is_anonymous', anonymous ? 'true' : 'false');
      if (locationId) formData.append('location_id', String(locationId));
      if (screenshotFile) formData.append('screenshot', screenshotFile);

      const res = await fetch(`${BASE_URL}/donate`, {
        method: 'POST',
        body: formData,
        // Note: do NOT set Content-Type header — fetch sets it automatically with the correct boundary for FormData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Donation submission failed');
      }

      const created = await res.json();
      // Refresh after mutation
      await fetchDashboard();
      await fetchDonations(currentUser);
      return created;
    } catch (e) {
      setApiError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchDashboard, fetchDonations]);

  // ── POST /expense  JSON  (requires JWT) ───────────────────────────────────
  // Body: { amount, description }
  // Returns: ExpenseResponse { id, amount, description, created_at }
  // Errors: 400 if amount > remaining balance ("Insufficient funds for this expense.")
  const addExpense = useCallback(async (amount, description) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${BASE_URL}/expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ amount: parseFloat(amount), description }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to record expense');
      }

      const created = await res.json();
      // Refresh after mutation
      await fetchDashboard();
      await fetchExpenses();
      return created;
    } catch (e) {
      setApiError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDashboard, fetchExpenses]);

  // ── PUT /admin/donations/{id}/verify  (requires JWT) ──────────────────────
  // Returns: DonationResponse with is_verified = true
  const verifyDonation = useCallback(async (donationId) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${BASE_URL}/admin/donations/${donationId}/verify`, {
        method: 'PUT',
        headers: authHeader(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Verification failed');
      }
      // Refresh after mutation
      await fetchDashboard();
      await fetchDonations(currentUser);
    } catch (e) {
      setApiError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchDashboard, fetchDonations]);

  // ── POST /admin/donations  JSON  (requires JWT) ───────────────────────────
  // Body: { amount, donor_name?, is_anonymous?, location_id? }  → auto-verified
  const addManualDonation = useCallback(async (amount, donorName, isAnonymous, locationId = null) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${BASE_URL}/admin/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          donor_name: isAnonymous ? 'Anonymous' : (donorName || 'Anonymous'),
          is_anonymous: isAnonymous,
          location_id: locationId || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to add manual donation');
      }
      const created = await res.json();
      await fetchDashboard();
      await fetchDonations(currentUser);
      return created;
    } catch (e) {
      setApiError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchDashboard, fetchDonations]);

  // ── POST /admin/locations  JSON  (requires JWT) ───────────────────────────
  // Body: { name }  →  LocationResponse { id, name }
  const addLocation = useCallback(async (name) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${BASE_URL}/admin/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to add location');
      }
      return await res.json();
    } catch (e) {
      setApiError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    // State
    currentUser,
    donations,
    expenses,
    totalFunds,
    totalExpenses,
    balance,
    isLoading,
    apiError,
    // Auth
    signup,
    login,
    logout,
    clearError,
    // Data mutations
    addDonation,
    addExpense,
    verifyDonation,
    addManualDonation,
    addLocation,
    // Refetch helpers
    fetchDashboard,
    fetchDonations,
    fetchExpenses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
