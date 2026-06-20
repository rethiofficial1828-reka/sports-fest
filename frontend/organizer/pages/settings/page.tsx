"use client";

import { useState } from "react";
import { User, Lock, Bell, Shield, Save } from "lucide-react";
import { useAuth } from "@/frontend/shared/context/AuthContext";

export default function SettingsPage() {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#6B46C1] text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 surface p-6 sm:p-8 shadow-sm border border-slate-200 rounded-2xl">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#111827] mb-6 border-b border-slate-100 pb-4">Profile Information</h2>
              
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-[#111827] mb-2">Full Name</label>
                  <input type="text" className="input w-full px-4 py-2.5" defaultValue={user?.user_metadata?.full_name || "Demo User"} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-[#111827] mb-2">Email Address</label>
                  <input type="email" className="input w-full px-4 py-2.5" defaultValue={user?.email || "user@college.edu.in"} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-[#111827] mb-2">Bio</label>
                  <textarea className="input w-full px-4 py-2.5 min-h-[100px]" defaultValue="Sports enthusiast and event organizer."></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-sm">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab !== "profile" && (
            <div className="text-center py-10 text-slate-500">
              <p className="font-medium text-lg text-[#111827]">Coming Soon</p>
              <p className="text-sm">This section is currently under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
