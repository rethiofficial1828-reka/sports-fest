"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  UserX, 
  UserCheck, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Loader2,
  Mail
} from "lucide-react";

const DEFAULT_USERS: any[] = [];

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "admin" | "organizer" | "student" | "blocked">("all");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlock = async (id: string, name: string, currentlyBlocked: boolean) => {
    const targetUser = users.find((u) => u.id === id);
    if (targetUser?.role === "admin") {
      alert("Admin accounts cannot be blocked.");
      return;
    }
    const action = currentlyBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} ${name}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isBlocked: !currentlyBlocked })
      });
      if (res.ok) {
        setUsers(users.map((u) => u.id === id ? { ...u, isBlocked: !currentlyBlocked } : u));
        setMessage({
          text: `Successfully ${currentlyBlocked ? "unblocked" : "blocked"} user ${name}.`,
          type: "success"
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update block status.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to modify block status.");
    }
  };

  const handleToggleRole = async (id: string, name: string, currentRole: string) => {
    if (currentRole === "admin") {
      alert("Admin roles cannot be changed from this screen.");
      return;
    }

    const nextRole = currentRole === "student" ? "organizer" : "student";
    if (!window.confirm(`Change ${name}'s role from ${currentRole} to ${nextRole}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: nextRole })
      });
      if (res.ok) {
        setUsers(users.map((u) => u.id === id ? { 
          ...u, 
          role: nextRole,
          institution: nextRole === "organizer" ? (u.institution || "Enter College Name") : ""
        } : u));
        setMessage({
          text: `Successfully updated ${name}'s role to ${nextRole}.`,
          type: "success"
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to change user role.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to change user role.");
    }
  };

  // Filter & Search logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.institution?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Robust role resolution to prevent mismatched roles
    const getUserRole = (u: any) => {
      return u.role || "student";
    };

    const userRole = getUserRole(user);

    if (activeTab === "all") return true;
    if (activeTab === "blocked") return user.isBlocked === true;
    return userRole === activeTab && !user.isBlocked;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight">User Management</h1>
        <p className="text-slate-500 font-medium mt-1">Manage accounts, toggle roles, and restrict platform access.</p>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border rounded-2xl text-sm font-medium flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10 pr-4 py-3 text-sm bg-white"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap bg-white border border-slate-200 p-1.5 rounded-2xl gap-1 w-full sm:w-auto">
          {(["all", "admin", "organizer", "student", "blocked"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-[#EF4444] text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab === "admin" ? "Admins" : tab === "organizer" ? "Organizers" : tab === "student" ? "Students" : tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#EF4444]" />
        </div>
      ) : (
        <div className="surface shadow-sm border border-slate-200 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Institution</th>
                  <th className="px-6 py-4">Account Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            user.role === "admin"
                              ? "bg-rose-50 text-rose-600"
                              : user.role === "organizer"
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {user.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#111827]">{user.full_name}</p>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 flex items-center gap-1.5">
                          {user.role === "organizer" ? (
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                          )}
                          {user.institution || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          user.role === "admin"
                            ? "bg-rose-50 border border-rose-200 text-rose-600"
                            : user.role === "organizer"
                              ? "bg-indigo-50 border border-indigo-200 text-indigo-600"
                              : "bg-emerald-50 border border-emerald-200 text-emerald-600"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          user.isBlocked 
                            ? "bg-red-50 border border-red-200 text-red-600" 
                            : "bg-emerald-50 border border-emerald-200 text-emerald-600"
                        }`}>
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          {user.role !== "admin" ? (
                            <>
                              <button
                                onClick={() => handleToggleRole(user.id, user.full_name, user.role)}
                                className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all shadow-sm"
                                title="Toggle User Role"
                              >
                                Toggle Role
                              </button>
                              <button
                                onClick={() => handleToggleBlock(user.id, user.full_name, user.isBlocked)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 border ${
                                  user.isBlocked
                                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border-emerald-200"
                                    : "bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200"
                                }`}
                              >
                                {user.isBlocked ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Unblock
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    Block
                                  </>
                                )}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold px-3 py-1.5 border border-slate-100 rounded-xl bg-slate-50 cursor-not-allowed">
                              Protected Admin
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
