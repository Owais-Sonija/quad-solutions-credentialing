import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import Navbar from '../../components/layout/Navbar';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900">
          {payload[0].payload.request_type || label}
        </p>
        <p className="text-sm text-blue-600">
          Count: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric' 
  });
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  in_review: '#3b82f6',
  approved: '#10b981',
  rejected: '#ef4444'
};

const DOC_COLORS = {
  license: '#3b82f6',
  certificate: '#8b5cf6',
  insurance: '#10b981',
  identity: '#f59e0b',
  other: '#6b7280'
};

const AdminAnalytics = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/analytics');
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Analytics error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600 bg-green-50';
    if (rate >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatRequestType = (type: string) => {
    if (type === 'Initial Credentialing') return 'Initial';
    if (type === 'Re-credentialing') return 'Re-cred';
    if (type === 'Primary Source Verification') return 'PSV';
    return type.substring(0, 8);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SECTION 1 - Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Comprehensive overview of credentialing operations</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                🔄 Refresh
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* SECTION 2 - KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-3xl font-bold text-blue-900">{data.overview.total_requests}</div>
                <div className="text-sm font-medium text-blue-600 mt-1">Total Requests</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">⏳</div>
                <div className="text-3xl font-bold text-yellow-900">{data.overview.pending}</div>
                <div className="text-sm font-medium text-yellow-600 mt-1">Pending</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">👀</div>
                <div className="text-3xl font-bold text-purple-900">{data.overview.in_review}</div>
                <div className="text-sm font-medium text-purple-600 mt-1">In Review</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-3xl font-bold text-green-900">{data.overview.approved}</div>
                <div className="text-sm font-medium text-green-600 mt-1">Approved</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">❌</div>
                <div className="text-3xl font-bold text-red-900">{data.overview.rejected}</div>
                <div className="text-sm font-medium text-red-600 mt-1">Rejected</div>
              </div>
              <div className={`border border-opacity-50 rounded-xl p-4 shadow-sm ${getRateColor(data.overview.approval_rate)}`}>
                <div className="text-2xl mb-2">📈</div>
                <div className="text-3xl font-bold">
                  {data.overview.approval_rate}%
                </div>
                <div className="text-sm font-medium mt-1">Approval Rate</div>
              </div>
            </div>

            {/* SECTION 3 - Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Requests by Specialty</h3>
                <div className="h-[250px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.by_specialty}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="specialty" 
                        type="category" 
                        width={150}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.length > 18 
                          ? value.substring(0, 18) + '...' 
                          : value
                        }
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Distribution</h3>
                <div className="h-[250px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: data.overview.pending, color: '#f59e0b' },
                          { name: 'In Review', value: data.overview.in_review, color: '#3b82f6' },
                          { name: 'Approved', value: data.overview.approved, color: '#10b981' },
                          { name: 'Rejected', value: data.overview.rejected, color: '#ef4444' },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {
                          [
                            { name: 'Pending', value: data.overview.pending, color: '#f59e0b' },
                            { name: 'In Review', value: data.overview.in_review, color: '#3b82f6' },
                            { name: 'Approved', value: data.overview.approved, color: '#10b981' },
                            { name: 'Rejected', value: data.overview.rejected, color: '#ef4444' },
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value}`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SECTION 4 - Full width */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Requests Over Last 30 Days</h3>
              {data.over_time && data.over_time.length > 0 ? (
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.over_time}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        minTickGap={20}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => formatDate(label as string)}
                        content={<CustomTooltip />}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No requests in the last 30 days
                </div>
              )}
            </div>

            {/* SECTION 5 - Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Requests by Type</h3>
                <div className="h-[250px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.by_type.map((item: any) => ({
                        ...item,
                        shortType: formatRequestType(item.request_type)
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="shortType" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Documents by Type</h3>
                  <p className="text-sm text-gray-500">Total: {data.documents.total_documents}</p>
                </div>
                <div className="h-[250px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Medical License', value: data.documents.license, color: '#3b82f6' },
                          { name: 'Certificate', value: data.documents.certificate, color: '#8b5cf6' },
                          { name: 'Insurance', value: data.documents.insurance, color: '#10b981' },
                          { name: 'Identity', value: data.documents.identity, color: '#f59e0b' },
                          { name: 'Other', value: data.documents.other, color: '#6b7280' },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {
                          [
                            { name: 'Medical License', value: data.documents.license, color: '#3b82f6' },
                            { name: 'Certificate', value: data.documents.certificate, color: '#8b5cf6' },
                            { name: 'Insurance', value: data.documents.insurance, color: '#10b981' },
                            { name: 'Identity', value: data.documents.identity, color: '#f59e0b' },
                            { name: 'Other', value: data.documents.other, color: '#6b7280' },
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SECTION 6 - Summary cards row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users Registered</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.overview.total_users}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Documents Uploaded</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.documents.total_documents}</p>
                </div>
                <div className="text-3xl">📄</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg. Requests / User</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data.overview.total_users > 0 
                      ? (data.overview.total_requests / data.overview.total_users).toFixed(1) 
                      : '0'}
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AdminAnalytics;
