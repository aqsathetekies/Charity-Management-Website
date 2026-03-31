import { useState } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import GlowButton from '../components/GlowButton';
import DataTable from '../components/DataTable';
import { 
  HiOutlinePencilAlt, 
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineClipboardList
} from 'react-icons/hi';
import { BsCurrencyRupee } from 'react-icons/bs';

// Safe date formatter — handles null / undefined / invalid ISO strings
const fmtDateTime = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
};

export default function Expenses() {
  const { expenses, addExpense, isLoading, apiError, clearError } = useApp();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!amount || isNaN(amount)) errs.amount = 'Enter a valid amount';
    else if (parseFloat(amount) <= 0) errs.amount = 'Amount must be greater than 0';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await addExpense(amount, description);
      setSuccess(true);
      setAmount('');
      setDescription('');
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // apiError is set in context — displayed below
    }
  };

  // Expense table columns — keys match the normalized expense shape from context
  // { id, amount, description, date (= created_at), created_at }
  const columns = [
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="amount-badge amount-badge--expense">-₨{(val || 0).toLocaleString()}</span>,
    },
    { key: 'description', label: 'Description' },
    {
      key: 'date',
      label: 'Date',
      render: (val, row) => (
        <span className="date-text">{fmtDateTime(val || row.created_at)}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h1>Expense Management</h1>
        <p>Record and track organizational expenses</p>
      </div>

      <div className="expenses-layout">
        <div>
          {success && (
            <div className="success-message" style={{ marginBottom: 16 }}>
              <div className="icon"><HiOutlineCheckCircle /></div>
              <h3>Expense Added</h3>
              <p>The expense has been recorded and the dashboard is updated.</p>
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
            <h3 className="section-title" style={{ marginBottom: 20 }}>
              <span className="icon"><HiOutlinePlus /></span> Add Expense
            </h3>
            <form onSubmit={handleSubmit}>
              <InputField
                label="Expense Amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  clearError();
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                icon={<BsCurrencyRupee />}
                placeholder="e.g. 500"
                error={errors.amount}
                min="0"
                step="0.01"
                required
              />
              <InputField
                label="Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError();
                  if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                }}
                icon={<HiOutlinePencilAlt />}
                placeholder="What was this expense for?"
                error={errors.description}
                required
              />
              <GlowButton type="submit" fullWidth loading={isLoading} icon={<HiOutlinePlus />}>
                Add Expense
              </GlowButton>
            </form>
          </GlassCard>
        </div>

        <div className="animate-slide-up stagger-2">
          <h3 className="section-title">
            <span className="icon"><HiOutlineClipboardList /></span> All Expenses
          </h3>
          <DataTable columns={columns} data={expenses} emptyMessage="No expenses recorded yet" />
        </div>
      </div>
    </div>
  );
}
