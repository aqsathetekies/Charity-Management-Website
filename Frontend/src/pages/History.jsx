import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { 
  HiOutlineClipboardList, 
  HiOutlineEyeOff 
} from 'react-icons/hi';
import { BsCurrencyRupee } from 'react-icons/bs';

// Safe date+time formatter
const fmtDateTime = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
};

export default function History() {
  const { donations, expenses } = useApp();

  // Donation table columns
  // Context normalizes: name = donor_name, anonymous = is_anonymous, date = created_at
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
      key: 'is_verified',
      label: 'Status',
      render: (val) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: 20,
            fontSize: '0.78rem',
            fontWeight: 600,
            background: val ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
            color: val ? '#22c55e' : '#f59e0b',
            border: `1px solid ${val ? 'rgba(34,197,94,0.4)' : 'rgba(251,191,36,0.4)'}`,
          }}
        >
          {val ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (val, row) => (
        <span className="date-text">{fmtDateTime(val || row.created_at)}</span>
      ),
    },
  ];

  // Expense table columns
  // Context normalizes: date = created_at
  const expenseCols = [
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="amount-badge amount-badge--expense">-₨{(val || 0).toLocaleString()}</span>,
    },
    { key: 'description', label: 'Description' },
    {
      key: 'date',
      label: 'Date & Time',
      render: (val, row) => (
        <span className="date-text">{fmtDateTime(val || row.created_at)}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h1>Transaction History</h1>
        <p>Complete record of all donations and expenses</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div className="animate-slide-up stagger-1">
          <h3 className="section-title">
            <span className="icon"><BsCurrencyRupee /></span> Donations ({donations.length})
          </h3>
          <DataTable columns={donationCols} data={donations} emptyMessage="No donations recorded yet" />
        </div>

        <div className="animate-slide-up stagger-3">
          <h3 className="section-title">
            <span className="icon"><HiOutlineClipboardList /></span> Expenses ({expenses.length})
          </h3>
          <DataTable columns={expenseCols} data={expenses} emptyMessage="No expenses recorded yet" />
        </div>
      </div>
    </div>
  );
}
