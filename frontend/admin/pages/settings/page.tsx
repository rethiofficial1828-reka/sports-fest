"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Mail, 
  Phone,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface SystemSettings {
  instantPublish: boolean;
  allowExternalReg: boolean;
  enforceEmailDomain: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
  supportPhone: string;
  maxEventsPerCollege: number;
}

const DEFAULT_SETTINGS: SystemSettings = {
  instantPublish: true,
  allowExternalReg: true,
  enforceEmailDomain: false,
  maintenanceMode: false,
  supportEmail: "support@sportsfest.in",
  supportPhone: "+91 98765 43210",
  maxEventsPerCollege: 15,
};

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setIsLoading(true);
    try {
      const savedSettings = localStorage.getItem("sportsfest_admin_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem("sportsfest_admin_settings", JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof SystemSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key] as any
    }));
  };

  const handleInputChange = (key: keyof SystemSettings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Simulate saving delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      localStorage.setItem("sportsfest_admin_settings", JSON.stringify(settings));
      setMessage({ text: "System settings saved successfully!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: "Failed to save settings. Please try again.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Configure global directory restrictions, support contacts, and safety settings.</p>
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

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#EF4444]" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* General Platform Controls */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-xl font-bold text-[#111827] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Settings className="w-5 h-5 text-slate-400" /> Platform Configurations
            </h2>

            <div className="divide-y divide-slate-150 space-y-5">
              {/* Toggle: Instant Event Publishing */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-1 pr-4">
                  <p className="text-sm font-bold text-[#111827]">Instant Event Publishing</p>
                  <p className="text-xs text-slate-500 font-medium">Allow organizer fests to go live immediately without requiring manual admin approval.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("instantPublish")}
                  className="text-slate-700 hover:text-slate-900 transition-colors shrink-0"
                >
                  {settings.instantPublish ? (
                    <ToggleRight className="w-12 h-12 text-[#EF4444]" strokeWidth={1.2} />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-slate-300" strokeWidth={1.2} />
                  )}
                </button>
              </div>

              {/* Toggle: Allow Student self registrations */}
              <div className="flex items-center justify-between pt-5">
                <div className="space-y-1 pr-4">
                  <p className="text-sm font-bold text-[#111827]">Allow Self-Registrations</p>
                  <p className="text-xs text-slate-500 font-medium">Students can sign up on the platform and register for active events.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("allowExternalReg")}
                  className="text-slate-700 hover:text-slate-900 transition-colors shrink-0"
                >
                  {settings.allowExternalReg ? (
                    <ToggleRight className="w-12 h-12 text-[#EF4444]" strokeWidth={1.2} />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-slate-300" strokeWidth={1.2} />
                  )}
                </button>
              </div>

              {/* Toggle: Domain validation */}
              <div className="flex items-center justify-between pt-5">
                <div className="space-y-1 pr-4">
                  <p className="text-sm font-bold text-[#111827]">Restrict Email Domains</p>
                  <p className="text-xs text-slate-500 font-medium">Enforce that all organizer registrations end in college email formats (e.g. edu.in, ac.in).</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("enforceEmailDomain")}
                  className="text-slate-700 hover:text-slate-900 transition-colors shrink-0"
                >
                  {settings.enforceEmailDomain ? (
                    <ToggleRight className="w-12 h-12 text-[#EF4444]" strokeWidth={1.2} />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-slate-300" strokeWidth={1.2} />
                  )}
                </button>
              </div>

              {/* Toggle: Maintenance Mode */}
              <div className="flex items-center justify-between pt-5">
                <div className="space-y-1 pr-4">
                  <p className="text-sm font-bold text-[#111827]">Maintenance Mode</p>
                  <p className="text-xs text-slate-500 font-medium">Temporarily disable student registrations and listings uploads for platform updates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("maintenanceMode")}
                  className="text-slate-700 hover:text-slate-900 transition-colors shrink-0"
                >
                  {settings.maintenanceMode ? (
                    <ToggleRight className="w-12 h-12 text-[#EF4444]" strokeWidth={1.2} />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-slate-300" strokeWidth={1.2} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* System Limits & Limits */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-xl font-bold text-[#111827] flex items-center gap-2 border-b border-slate-100 pb-4">
              <HelpCircle className="w-5 h-5 text-slate-400" /> Platform Thresholds
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#111827] mb-2">Max Tournaments Per College</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.maxEventsPerCollege}
                  onChange={(e) => handleInputChange("maxEventsPerCollege", parseInt(e.target.value) || 0)}
                  className="input w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200"
                />
                <p className="text-xs text-slate-400 font-medium mt-1.5">Limits maximum active published fests a verified host can list simultaneously.</p>
              </div>
            </div>
          </div>

          {/* Support and contact details */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-xl font-bold text-[#111827] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Mail className="w-5 h-5 text-slate-400" /> Support Contact Coordinates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#111827] mb-2">System Support Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleInputChange("supportEmail", e.target.value)}
                    className="input w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200"
                    placeholder="support@sportsfest.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111827] mb-2">System Support Phone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => handleInputChange("supportPhone", e.target.value)}
                    className="input w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#EF4444] hover:bg-[#D9383A] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-75"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configurations
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
