import { useState, useEffect } from "react";
import { Users, Search, Loader2, ShieldCheck, ShieldAlert, Power, Trash2 } from "lucide-react";
import { alumniManagerApi, userApi } from "../../../lib/api";

export function AlumniUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const role = localStorage.getItem("userRole");
  const isAdmin = role === "ADMIN";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await alumniManagerApi.registrations.getAll().catch(() => null);
      if (res?.data) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await alumniManagerApi.users.updateStatus(id, newStatus);
      alert(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to update user status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this alumni user? This action is permanent.")) {
      try {
        await userApi.deleteUser(id);
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alumni Users</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage active alumni accounts and permissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900">All Alumni Accounts</h3>
          </div>
          
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest rounded-tl-2xl">User</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined Date</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-900">{u.name}</p>
                      <p className="text-xs font-medium text-slate-500">{u.id}</p>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">{u.role}</td>
                    <td className="p-4 text-sm font-medium text-slate-600">{u.joined}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.status === 'Active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`p-2 rounded-xl transition-colors ${
                          u.status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                        }`} 
                        title={u.status === 'Active' ? 'Suspend User' : 'Activate User'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-2" 
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
