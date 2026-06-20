import { headers } from 'next/headers';

async function getUsers() {
  const adminSecret = process.env.ADMIN_SECRET || 'secret_password_here';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    const res = await fetch(`${apiUrl}/api/admin/users`, {
      headers: {
        'x-admin-secret': adminSecret
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return [];
    }
    
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch users:', e);
    return [];
  }
}

export default async function AdminDashboard() {
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4">
          Antigravity Admin Dashboard
        </h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-800">Telegram User</th>
                  <th className="px-6 py-4 border-b border-slate-800">Activity Logs</th>
                  <th className="px-6 py-4 border-b border-slate-800">Consent Status</th>
                  <th className="px-6 py-4 border-b border-slate-800">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{user.first_name} {user.last_name || ''}</div>
                        <div className="text-slate-500 text-xs mt-1">@{user.username || 'unknown'}</div>
                        <div className="text-slate-600 text-[10px] mt-0.5">ID: {user.telegram_id}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs"><span className="text-slate-500">Joined:</span> {new Date(user.created_at).toLocaleDateString()}</span>
                          <span className="text-xs"><span className="text-slate-500">Last Login:</span> {new Date(user.last_login).toLocaleString()}</span>
                          <span className="text-xs"><span className="text-slate-500">Habits:</span> {user.stats?.total_habits || 0}</span>
                          <span className="text-xs"><span className="text-slate-500">Total Streaks:</span> {user.stats?.current_streak || 0}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider ${user.permissions?.is_logging_allowed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            Logging: {user.permissions?.is_logging_allowed ? 'Allowed' : 'Denied'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider ${user.permissions?.is_notification_allowed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            Notifs: {user.permissions?.is_notification_allowed ? 'Allowed' : 'Denied'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {user.permissions?.is_logging_allowed && user.location ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-300">{user.location.city}, {user.location.country}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-1">
                              {user.location.latitude.toFixed(4)}, {user.location.longitude.toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 italic">Hidden / Not Allowed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
