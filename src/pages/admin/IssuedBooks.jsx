import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  AlertCircle, 
  Clock, 
  XCircle,
  CheckCircle,
  X,
  Package,
  Search,
  Sparkles,
  ArrowUpRight,
  Download,
  ArrowUpDown,
  Filter,
  Calendar
} from 'lucide-react';
import api from '../../utils/api';

const IssuedBooks = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [borrows, setBorrows] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    issued: 0,
    overdue: 0,
    returnRequested: 0,
    lost: 0
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sorting
  const [sortField, setSortField] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    issueFrom: '',
    issueTo: '',
    dueFrom: '',
    dueTo: '',
    department: '',
    fineMin: '',
    fineMax: ''
  });
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [approveData, setApproveData] = useState({
    condition: 'good',
    damage_amount: '',
    damage_note: ''
  });
  const [lostData, setLostData] = useState({
    fine_amount: '500',
    note: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBorrows();
  }, [activeTab, page]);

  useEffect(() => {
    const statusFromUrl = new URLSearchParams(location.search).get('status');
    const allowed = ['issued', 'overdue', 'return_requested', 'lost'];
    if (statusFromUrl && allowed.includes(statusFromUrl)) {
      setActiveTab(statusFromUrl);
      setPage(1);
    }
  }, [location.search]);

  const fetchStatusCounts = async () => {
    try {
      const statuses = ['issued', 'overdue', 'return_requested', 'lost'];
      const responses = await Promise.all(
        statuses.map((status) =>
          api.get('/borrow/issued', {
            params: { status, page: 1, limit: 1 }
          })
        )
      );

      const [issuedRes, overdueRes, returnReqRes, lostRes] = responses;
      const issued = issuedRes.data.data.pagination?.total || 0;
      const overdue = overdueRes.data.data.pagination?.total || 0;
      const returnRequested = returnReqRes.data.data.pagination?.total || 0;
      const lost = lostRes.data.data.pagination?.total || 0;

      setStats({
        total: issued + overdue + returnRequested + lost,
        issued,
        overdue,
        returnRequested,
        lost
      });
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const statusParam = activeTab === 'all' ? '' : activeTab;
      const response = await api.get('/borrow/issued', {
        params: { status: statusParam, page, limit: 10 }
      });
      
      const data = response.data.data;
      setBorrows(data.borrows || []);
      setTotalPages(data.pagination?.pages || 1);
      fetchStatusCounts();
    } catch (error) {
      console.error('Error fetching issued books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBorrows = useMemo(() => {
    let result = [...borrows];
    
    // Search filter
    const key = searchTerm.trim().toLowerCase();
    if (key) {
      result = result.filter((borrow) => {
        const haystack = [
          borrow.user?.name,
          borrow.user?.email,
          borrow.book?.title,
          borrow.book?.isbn
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(key);
      });
    }
    
    // Advanced filters
    if (filters.issueFrom) {
      const from = new Date(filters.issueFrom);
      result = result.filter(b => new Date(b.issue_date) >= from);
    }
    if (filters.issueTo) {
      const to = new Date(filters.issueTo);
      to.setHours(23, 59, 59);
      result = result.filter(b => new Date(b.issue_date) <= to);
    }
    if (filters.dueFrom) {
      const from = new Date(filters.dueFrom);
      result = result.filter(b => new Date(b.due_date) >= from);
    }
    if (filters.dueTo) {
      const to = new Date(filters.dueTo);
      to.setHours(23, 59, 59);
      result = result.filter(b => new Date(b.due_date) <= to);
    }
    if (filters.department) {
      result = result.filter(b => b.user?.department === filters.department);
    }
    if (filters.fineMin !== '') {
      const min = parseFloat(filters.fineMin);
      result = result.filter(b => getDisplayFine(b) >= min);
    }
    if (filters.fineMax !== '') {
      const max = parseFloat(filters.fineMax);
      result = result.filter(b => getDisplayFine(b) <= max);
    }
    
    // Sorting
    result.sort((a, b) => {
      let aVal, bVal;
      
      switch(sortField) {
        case 'user':
          aVal = a.user?.name || '';
          bVal = b.user?.name || '';
          break;
        case 'book':
          aVal = a.book?.title || '';
          bVal = b.book?.title || '';
          break;
        case 'issue_date':
          aVal = new Date(a.issue_date || 0).getTime();
          bVal = new Date(b.issue_date || 0).getTime();
          break;
        case 'due_date':
          aVal = new Date(a.due_date || 0).getTime();
          bVal = new Date(b.due_date || 0).getTime();
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        case 'fine':
          aVal = getDisplayFine(a);
          bVal = getDisplayFine(b);
          break;
        default:
          aVal = a.id;
          bVal = b.id;
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [borrows, searchTerm, filters, sortField, sortOrder]);

  const handleApproveReturn = (borrow) => {
    setSelectedBorrow(borrow);
    setApproveData({ condition: 'good', damage_amount: '', damage_note: '' });
    setShowApproveModal(true);
  };

  const handleMarkLost = (borrow) => {
    setSelectedBorrow(borrow);
    setLostData({ fine_amount: '500', note: '' });
    setShowLostModal(true);
  };

  const submitApproval = async () => {
    if (approveData.condition === 'damaged' && (!approveData.damage_amount || parseFloat(approveData.damage_amount) <= 0)) {
      alert('Please enter a damage amount');
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        condition: approveData.condition,
        ...(approveData.condition !== 'good' && {
          damage_amount: parseFloat(approveData.damage_amount),
          damage_note: approveData.damage_note
        })
      };

      await api.post(`/borrow/admin/${selectedBorrow.id}/approve-return`, payload);
      alert('Return approved successfully!');
      setShowApproveModal(false);
      fetchBorrows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve return');
    } finally {
      setProcessing(false);
    }
  };

  const submitMarkLost = async () => {
    if (!lostData.fine_amount || parseFloat(lostData.fine_amount) <= 0) {
      alert('Please enter a fine amount');
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/borrow/admin/${selectedBorrow.id}/mark-lost`, {
        fine_amount: parseFloat(lostData.fine_amount),
        note: lostData.note
      });
      alert('Book marked as lost!');
      setShowLostModal(false);
      fetchBorrows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark as lost');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectReturn = async (borrowId) => {
    if (!window.confirm('Reject this return request?')) return;

    try {
      await api.put(`/borrow/admin/${borrowId}/reject-return`, {
        reason: 'Rejected by admin'
      });
      alert('Return request rejected');
      fetchBorrows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject return');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      issued: 'bg-blue-100 text-blue-800 border-blue-300',
      overdue: 'bg-red-100 text-red-800 border-red-300',
      return_requested: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      lost: 'bg-gray-100 text-gray-800 border-gray-300',
      closed: 'bg-slate-100 text-slate-700 border-slate-300'
    };

    const labels = {
      issued: 'Issued',
      overdue: 'Overdue',
      return_requested: 'Return Requested',
      lost: 'Lost',
      closed: 'Lost Closed'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getDaysInfo = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      return { text: `${diffDays} days left`, color: 'text-green-600' };
    } else {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    }
  };

  const formatDateSafe = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const getDisplayFine = (borrow) => {
    const computedFine = Number(borrow?.currentFine);
    const storedFine = Number(borrow?.fine_amount);

    // For active loans, backend provides a live computed fine as currentFine.
    if (Number.isFinite(computedFine) && computedFine > 0) {
      return computedFine;
    }

    return Number.isFinite(storedFine) ? storedFine : 0;
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 opacity-30" />;
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  
  const exportToCSV = () => {
    const csvData = filteredBorrows.map(borrow => ({
      'Borrow ID': borrow.id,
      'Student Name': borrow.user?.name || '',
      'Email': borrow.user?.email || '',
      'Department': borrow.user?.department || '',
      'Book Title': borrow.book?.title || '',
      'ISBN': borrow.book?.isbn || '',
      'Issue Date': formatDateSafe(borrow.issue_date),
      'Due Date': formatDateSafe(borrow.due_date),
      'Status': borrow.status,
      'Fine (৳)': getDisplayFine(borrow).toFixed(2)
    }));
    
    if (csvData.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `issued-books-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  const departments = useMemo(() => {
    const depts = new Set();
    borrows.forEach(b => {
      if (b.user?.department) depts.add(b.user.department);
    });
    return Array.from(depts).sort();
  }, [borrows]);
  
  const clearFilters = () => {
    setFilters({
      issueFrom: '',
      issueTo: '',
      dueFrom: '',
      dueTo: '',
      department: '',
      fineMin: '',
      fineMax: ''
    });
  };
  
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const tabs = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'issued', label: 'Issued', count: stats.issued },
    { key: 'overdue', label: 'Overdue', count: stats.overdue },
    { key: 'return_requested', label: 'Return Requests', count: stats.returnRequested },
    { key: 'lost', label: 'Lost', count: stats.lost }
  ];

  return (
    <AdminLayout>
      <div className="deck-shell p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute -top-24 right-10 h-60 w-60 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative space-y-6">
          <section className="deck-hero dashboard-reveal overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(34,211,238,0.2),transparent_36%),radial-gradient(circle_at_85%_24%,rgba(99,102,241,0.22),transparent_32%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Issuance Command Deck
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl" style={{ fontFamily: 'Fraunces, serif' }}>
                  Borrow Lifecycle Control
                </h1>
                <p className="mt-3 max-w-xl text-sm text-slate-200 sm:text-base">
                  Supervise issued inventory, expedite return approvals, and control overdue/lost risk with faster admin workflows.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-400/35 bg-slate-900/45 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Queue Snapshot</p>
                <div className="mt-3 space-y-2 text-sm text-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Pending Return Requests</span>
                    <span className="font-semibold text-amber-300">{stats.returnRequested}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overdue Exposure</span>
                    <span className="font-semibold text-rose-300">{stats.overdue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lost Cases</span>
                    <span className="font-semibold text-slate-200">{stats.lost}</span>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-slate-200">
                  <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />
                  Track, decide, and close faster
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="deck-panel deck-hover rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Total Active</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.total}</p>
                </div>
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-2.5">
                  <BookOpen className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </article>

            <article className="deck-panel deck-hover rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Overdue</p>
                  <p className="mt-2 text-3xl font-semibold text-rose-700">{stats.overdue}</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5">
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </article>

            <article className="deck-panel deck-hover rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Return Requests</p>
                  <p className="mt-2 text-3xl font-semibold text-amber-700">{stats.returnRequested}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </article>

            <article className="deck-panel deck-hover rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lost Cases</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-800">{stats.lost}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-100 p-2.5">
                  <Package className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </article>
          </section>

          <section className="deck-panel rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <nav className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setPage(1);
                    }}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 ${
                      activeTab === tab.key
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1.5 rounded-full bg-white/75 px-1.5 py-0.5 text-[10px]">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative w-full lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search student, email, or ISBN"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 transition-all duration-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    hasActiveFilters
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-xs text-white">•</span>}
                </button>
                
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100"
                  title="Export to CSV"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Advanced Filters
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Issue Date From</label>
                    <input
                      type="date"
                      value={filters.issueFrom}
                      onChange={(e) => setFilters({...filters, issueFrom: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Issue Date To</label>
                    <input
                      type="date"
                      value={filters.issueTo}
                      onChange={(e) => setFilters({...filters, issueTo: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Due Date From</label>
                    <input
                      type="date"
                      value={filters.dueFrom}
                      onChange={(e) => setFilters({...filters, dueFrom: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Due Date To</label>
                    <input
                      type="date"
                      value={filters.dueTo}
                      onChange={(e) => setFilters({...filters, dueTo: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                    <select
                      value={filters.department}
                      onChange={(e) => setFilters({...filters, department: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Fine Min (৳)</label>
                    <input
                      type="number"
                      value={filters.fineMin}
                      onChange={(e) => setFilters({...filters, fineMin: e.target.value})}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Fine Max (৳)</label>
                    <input
                      type="number"
                      value={filters.fineMax}
                      onChange={(e) => setFilters({...filters, fineMax: e.target.value})}
                      placeholder="Any"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <div className="text-xs text-slate-500 px-3 py-2">
                      {filteredBorrows.length} results
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredBorrows.length === 0 ? (
          <div className="deck-panel text-center py-12 rounded-2xl border border-slate-200">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No borrows found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'No results matched your search on this page'
                : activeTab === 'all'
                  ? 'No active borrows at the moment'
                  : `No ${activeTab} borrows`}
            </p>
          </div>
        ) : (
          <div className="deck-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th 
                      onClick={() => handleSort('user')}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-100 transition"
                    >
                      Student {getSortIcon('user')}
                    </th>
                    <th 
                      onClick={() => handleSort('book')}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-100 transition"
                    >
                      Book {getSortIcon('book')}
                    </th>
                    <th 
                      onClick={() => handleSort('issue_date')}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-100 transition"
                    >
                      Borrow Date {getSortIcon('issue_date')}
                    </th>
                    <th 
                      onClick={() => handleSort('due_date')}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-100 transition"
                    >
                      Due Date {getSortIcon('due_date')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-100 transition"
                    >
                      Status {getSortIcon('status')}
                    </th>
                    <th 
                      onClick={() => handleSort('fine')}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-100 transition"
                    >
                      Fine {getSortIcon('fine')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredBorrows.map((borrow) => {
                    const daysInfo = getDaysInfo(borrow.due_date);
                    return (
                      <tr key={borrow.id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{borrow.user?.name || 'N/A'}</div>
                            <div className="text-sm text-slate-500">{borrow.user?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{borrow.book?.title || 'N/A'}</div>
                            <div className="text-sm text-slate-500">ISBN: {borrow.book?.isbn}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatDateSafe(borrow.issue_date || borrow.borrow_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{new Date(borrow.due_date).toLocaleDateString()}</div>
                          <div className={`text-xs ${daysInfo.color}`}>{daysInfo.text}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(borrow.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          ৳{getDisplayFine(borrow).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {borrow.status === 'return_requested' && (
                              <>
                                <button
                                  onClick={() => handleApproveReturn(borrow)}
                                  className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                  title="Approve Return"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectReturn(borrow.id)}
                                  className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                  title="Reject Return"
                                >
                                  <X className="w-5 h-5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                            {(borrow.status === 'issued' || borrow.status === 'overdue') && (
                              <button
                                onClick={() => handleMarkLost(borrow)}
                                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                                title="Mark as Lost"
                              >
                                <XCircle className="w-5 h-5" />
                                <span>Mark Lost</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                <div>
                  <p className="text-sm text-slate-700">
                    Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Approve Return Modal */}
        {showApproveModal && (
          <Modal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            title="Approve Return"
          >
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Book: {selectedBorrow?.book?.title}</h4>
                <p className="text-sm text-blue-700 mt-1">Student: {selectedBorrow?.user?.name}</p>
                <p className="text-sm text-blue-700">Current Fine: ৳{parseFloat(selectedBorrow?.fine_amount || 0).toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Condition
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="condition"
                      value="good"
                      checked={approveData.condition === 'good'}
                      onChange={(e) => setApproveData({ ...approveData, condition: e.target.value })}
                      className="text-indigo-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Good Condition</div>
                      <div className="text-sm text-gray-500">No additional charges</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="condition"
                      value="damaged"
                      checked={approveData.condition === 'damaged'}
                      onChange={(e) => setApproveData({ ...approveData, condition: e.target.value })}
                      className="text-indigo-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Damaged</div>
                      <div className="text-sm text-gray-500">Apply damage fine</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="condition"
                      value="lost"
                      checked={approveData.condition === 'lost'}
                      onChange={(e) => setApproveData({ ...approveData, condition: e.target.value })}
                      className="text-indigo-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Lost/Severely Damaged</div>
                      <div className="text-sm text-gray-500">Apply full book cost fine</div>
                    </div>
                  </label>
                </div>
              </div>

              {(approveData.condition === 'damaged' || approveData.condition === 'lost') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fine Amount (৳)
                    </label>
                    <input
                      type="number"
                      value={approveData.damage_amount}
                      onChange={(e) => setApproveData({ ...approveData, damage_amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter fine amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={approveData.damage_note}
                      onChange={(e) => setApproveData({ ...approveData, damage_note: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                      placeholder="Describe the damage..."
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={submitApproval}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Approve Return</span>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Mark Lost Modal */}
        {showLostModal && (
          <Modal
            isOpen={showLostModal}
            onClose={() => setShowLostModal(false)}
            title="Mark Book as Lost"
          >
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900">Book: {selectedBorrow?.book?.title}</h4>
                <p className="text-sm text-red-700 mt-1">Student: {selectedBorrow?.user?.name}</p>
                <p className="text-sm text-red-700">Current Fine: ৳{parseFloat(selectedBorrow?.fine_amount || 0).toFixed(2)}</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This will mark the book as lost and add a fine to the student's account. This action cannot be easily undone.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fine Amount (৳)
                </label>
                <input
                  type="number"
                  value={lostData.fine_amount}
                  onChange={(e) => setLostData({ ...lostData, fine_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter fine amount"
                  min="0"
                  step="0.01"
                />
                <p className="mt-1 text-sm text-gray-500">Typically the full cost of the book</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={lostData.note}
                  onChange={(e) => setLostData({ ...lostData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowLostModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={submitMarkLost}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Mark as Lost</span>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};

export default IssuedBooks;
