import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Monitor, Smartphone, Clock } from 'lucide-react';

interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  email: string;
  loginDate: string;
  loginTime: string;
  logoutTime?: string;
  sessionDuration?: number;
  browser: string;
  operatingSystem: string;
  device: string;
  ipAddress: string;
  country: string;
  city: string;
  timeZone: string;
  loginStatus: 'success' | 'failed';
  failureReason?: string;
}

export default function ActivityMonitor() {
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '',
    country: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('arctic.token');
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(
        `${base}/admin/activities?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device === 'Mobile') return <Smartphone className="w-4 h-4" />;
    if (device === 'Tablet') return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">User Activity Monitor</h1>
          <p className="text-slate-400">Track and monitor all user login activities</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Input
              placeholder="Country"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </Card>

        {/* Activities Table */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Login Activities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Login Time</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Browser</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">OS</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Device</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Location</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4 text-white font-medium">{activity.userName}</td>
                    <td className="py-3 px-4 text-slate-300">{activity.email}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(activity.loginTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{activity.browser}</td>
                    <td className="py-3 px-4 text-slate-300">{activity.operatingSystem}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        {getDeviceIcon(activity.device)}
                        {activity.device}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {activity.country}, {activity.city}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={activity.loginStatus === 'success' ? 'bg-green-500' : 'bg-red-500'}
                      >
                        {activity.loginStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {activity.sessionDuration ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.floor(activity.sessionDuration / 60)}m
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activities.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No activities found
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Tablet() {
  return <Monitor className="w-4 h-4" />;
}
