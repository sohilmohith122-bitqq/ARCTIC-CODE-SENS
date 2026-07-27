import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Activity, TrendingUp, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  accountStatus: 'active' | 'blocked';
  loginCount: number;
  createdAt: string;
  lastLoginAt?: string;
  role: 'admin' | 'user';
}

interface Analytics {
  totalUsers: number;
  activeUsersToday: number;
  newUsersThisMonth: number;
  todayLogins: number;
  failedLogins: number;
  onlineUsers: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('arctic.token');
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, usersRes] = await Promise.all([
        fetch(`${base}/admin/analytics/dashboard`, { headers }),
        fetch(`${base}/admin/users`, { headers })
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, newStatus: 'active' | 'blocked') => {
    try {
      const token = localStorage.getItem('arctic.token');
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';
      const response = await fetch(`${base}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, accountStatus: newStatus } : u));
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('arctic.token');
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';
      const response = await fetch(`${base}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
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
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage users and monitor system activity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Today</p>
                <p className="text-2xl font-bold text-white">{analytics?.activeUsersToday || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">New This Month</p>
                <p className="text-2xl font-bold text-white">{analytics?.newUsersThisMonth || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Today's Logins</p>
                <p className="text-2xl font-bold text-white">{analytics?.todayLogins || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Failed Logins</p>
                <p className="text-2xl font-bold text-white">{analytics?.failedLogins || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Online Users</p>
                <p className="text-2xl font-bold text-white">{analytics?.onlineUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Logins</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Joined</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4 text-white">{user.fullName}</td>
                    <td className="py-3 px-4 text-slate-300">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={user.accountStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}
                      >
                        {user.accountStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{user.loginCount}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleBlockUser(
                              user.id,
                              user.accountStatus === 'active' ? 'blocked' : 'active'
                            )
                          }
                        >
                          {user.accountStatus === 'active' ? 'Block' : 'Unblock'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
