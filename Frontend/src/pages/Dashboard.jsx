import { useApp } from '../context/AppContext';
import SummaryCard from '../components/SummaryCard';
import DataTable from '../components/DataTable';
import { 
  HiOutlineTrendingDown, 
  HiOutlineScale,
  HiOutlineClipboardList,
  HiOutlineEyeOff,
  HiOutlineBadgeCheck,
  HiOutlineClock
} from 'react-icons/hi';
import { BsCurrencyRupee } from 'react-icons/bs';

// Safe date formatter — handles null/undefined/invalid dates
const fmtDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Dashboard() {
  const { totalFunds, totalExpenses, balance, donations, expenses, currentUser, verifyDonation, isLoading } = useApp();

  // Split donations for admin view
  const pendingDonations = currentUser?.role === 'admin'
    ? donations.filter((d) => !d.is_verified)
    : [];
  const recentDonations = donations.filter((d) => d.is_verified).slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);

  const donationCols = [
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="amount-badge">₨{(val || 0).toLocaleString()}</span>,
    },
    {
      key: 'name',
      label: 'Donor',
      render: (val, row) => (
        <span className={`name-badge ${row.is_anonymous ? 'name-badge--anonymous' : ''}`}>
          {row.is_anonymous ? (
            <>
              <HiOutlineEyeOff style={{ fontSize: '1rem' }} />
              <span>Anonymous</span>
            </>
          ) : (val || row.donor_name || 'Unknown')}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (val, row) => <span className="date-text">{fmtDate(val || row.created_at)}</span>,
    },
  ];

  const expenseCols = [
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="amount-badge amount-badge--expense">-₨{(val || 0).toLocaleString()}</span>,
    },
    { key: 'description', label: 'Description' },
    {
      key: 'date',
      label: 'Date',
      render: (val, row) => <span className="date-text">{fmtDate(val || row.created_at)}</span>,
    },
  ];

  // Pending donations table columns (admin only)
  const pendingCols = [
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="amount-badge">₨{(val || 0).toLocaleString()}</span>,
    },
    {
      key: 'name',
      label: 'Donor',
      render: (val, row) => (
        <span className={`name-badge ${row.is_anonymous ? 'name-badge--anonymous' : ''}`}>
          {row.is_anonymous ? (
            <>
              <HiOutlineEyeOff style={{ fontSize: '1rem' }} />
              <span>Anonymous</span>
            </>
          ) : (val || row.donor_name || 'Unknown')}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (val, row) => <span className="date-text">{fmtDate(val || row.created_at)}</span>,
    },
    {
      key: 'screenshot_url',
      label: 'Receipt',
      render: (val) =>
        val ? (
          <a
            href={`http://76.13.40.170:8001${val}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'underline' }}
          >
            View
          </a>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No file</span>
        ),
    },
    {
      key: 'id',
      label: 'Action',
      render: (val) => (
        <button
          disabled={isLoading}
          onClick={() => verifyDonation(val)}
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: '0.8rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <HiOutlineBadgeCheck style={{ fontSize: '0.95rem' }} />
          Verify
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h1>Dashboard</h1>
        <p>Overview of charity fund performance and activity</p>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <SummaryCard
          icon={<BsCurrencyRupee />}
          label="Total Funds Received"
          value={totalFunds}
          prefix="₨"
          delay={0.05}
        />
        <SummaryCard
          icon={<HiOutlineTrendingDown />}
          label="Total Expenses"
          value={totalExpenses}
          prefix="₨"
          delay={0.1}
        />
        <SummaryCard
          icon={<HiOutlineScale />}
          label="Remaining Balance"
          value={balance}
          prefix="₨"
          delay={0.15}
        />
      </div>

      {/* Pending Donations — Admin Only */}
      {currentUser?.role === 'admin' && (
        <div className="animate-slide-up stagger-2" style={{ marginTop: 32 }}>
          <h3 className="section-title">
            <span className="icon"><HiOutlineClock /></span>
            Pending Verification ({pendingDonations.length})
          </h3>
          <DataTable
            columns={pendingCols}
            data={pendingDonations}
            emptyMessage="No pending donations — all caught up!"
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="activity-grid" style={{ marginTop: 32 }}>
        <div className="animate-slide-up stagger-3">
          <h3 className="section-title">
            <span className="icon"><BsCurrencyRupee /></span> Recent Verified Donations
          </h3>
          <DataTable columns={donationCols} data={recentDonations} emptyMessage="No verified donations yet" />
        </div>
        <div className="animate-slide-up stagger-4">
          <h3 className="section-title">
            <span className="icon"><HiOutlineClipboardList /></span> Recent Expenses
          </h3>
          <DataTable columns={expenseCols} data={recentExpenses} emptyMessage="No expenses yet" />
        </div>
      </div>
    </div>
  );
}
