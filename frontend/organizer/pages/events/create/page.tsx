"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Upload, Trophy, Info, Users, CheckCircle2, Image as ImageIcon, Loader2, BookOpen, PhoneCall } from "lucide-react";
import { cn } from "@/backend/lib/utils/cn";
import { useRouter } from "next/navigation";
import { SPORTS } from "@/backend/lib/constants/sports";
import { useAuth } from "@/frontend/shared/context/AuthContext";
import { useEvents } from "@/frontend/shared/context/EventContext";

const STEPS = [
  { id: 1, name: "Basic Details", icon: Info },
  { id: 2, name: "Participants", icon: Users },
  { id: 3, name: "Prizes & Rewards", icon: Trophy },
  { id: 4, name: "Rules & Guidelines", icon: BookOpen },
  { id: 5, name: "Contact & Venue", icon: PhoneCall },
  { id: 6, name: "Review", icon: CheckCircle2 },
];

const CATEGORIES = [
  "Track & Field",
  "Court Sports",
  "Indoor Sports",
  "Water Sports",
  "Combat Sports",
  "Mind Sports",
  "E-Sports",
  "Other"
];

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { user } = useAuth();
  const { addEvent } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Set default values based on logged in user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.full_name || prev.contactName,
        contactEmail: user.email || prev.contactEmail,
        contactPhone: user.phone || prev.contactPhone,
        collegeName: user.institution || prev.collegeName,
      }));
    }
  }, [user]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    sportSlug: "",
    level: "college",
    description: "",
    eventDate: "",
    registrationDeadline: "",
    registrationUrl: "",
    fee: 0,
    posterUrl: "",
    category: "Track & Field",
    location: "",
    minParticipants: 1,
    maxParticipants: 100,
    isTeamEvent: false,
    teamSize: 1,
    minTeamSize: 1,
    maxTeamSize: 1,
    prizePool: 0,
    prizeFirst: "",
    prizeSecond: "",
    prizeThird: "",
    rewardsAdditional: "",
    trophyInfo: "",
    certificateInfo: "",
    rules: "",
    eligibility: "",
    rulesTeam: "",
    equipmentRequirements: "",
    conductRules: "",
    disqualificationConditions: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactAlternatePhone: "",
    collegeName: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTodayStartDateTimeString = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localToday = new Date(Date.now() - tzOffset);
    return localToday.toISOString().slice(0, 10) + "T00:00";
  };

  const getMinEventDate = () => {
    if (!formData.registrationDeadline) return getTodayStartDateTimeString();
    const regDateObj = new Date(formData.registrationDeadline);
    regDateObj.setDate(regDateObj.getDate() + 1);
    const tzOffset = regDateObj.getTimezoneOffset() * 60000;
    const localDate = new Date(regDateObj.getTime() - tzOffset);
    return localDate.toISOString().slice(0, 10) + "T00:00";
  };

  const getMaxRegDeadline = () => {
    if (!formData.eventDate) return undefined;
    const eventDateObj = new Date(formData.eventDate);
    eventDateObj.setDate(eventDateObj.getDate() - 1);
    const tzOffset = eventDateObj.getTimezoneOffset() * 60000;
    const localDate = new Date(eventDateObj.getTime() - tzOffset);
    return localDate.toISOString().slice(0, 10) + "T23:59";
  };

  const validateDates = (eventDate: string, regDeadline: string) => {
    if (!eventDate || !regDeadline) {
      setDateError(null);
      return true;
    }
    const eventD = new Date(eventDate);
    const regD = new Date(regDeadline);
    const todayStart = new Date(getTodayStartDateTimeString());
    
    if (regD < todayStart) {
      setDateError("Registration deadline cannot be in the past.");
      return false;
    }
    if (eventD < todayStart) {
      setDateError("Event start date cannot be in the past.");
      return false;
    }
    
    const eventDay = new Date(eventD.getFullYear(), eventD.getMonth(), eventD.getDate());
    const regDay = new Date(regD.getFullYear(), regD.getMonth(), regD.getDate());
    
    if (regDay >= eventDay) {
      setDateError("Registration deadline must be at least one day before the Event Start Date.");
      return false;
    }
    
    setDateError(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.sportSlug || !formData.eventDate || !formData.registrationDeadline || !formData.location) {
        alert("Please fill in all required fields marked with *");
        return;
      }
      if (!validateDates(formData.eventDate, formData.registrationDeadline)) {
        alert(dateError || "Invalid dates selected.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.registrationUrl) {
        alert("Please enter the External Registration URL.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setImageError("Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.");
        alert("Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("File size exceeds 5MB limit.");
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, posterUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.sportSlug || !formData.eventDate || !formData.registrationDeadline || !formData.location || !formData.registrationUrl) {
      alert("Please fill in all required fields marked with *");
      return;
    }
    setIsSubmitting(true);
    try {
      const sportObj = SPORTS.find(s => s.slug === formData.sportSlug) || SPORTS[0];
      const eventSlug = formData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);
      const userInstitution = formData.collegeName || user?.institution || "IIT Madras";

      let instantPublish = true;
      try {
        const savedSettings = localStorage.getItem("sportsfest_admin_settings");
        if (savedSettings) {
          instantPublish = JSON.parse(savedSettings).instantPublish;
        }
      } catch (e) {
        console.error(e);
      }

      const newEventData = {
        title: formData.title,
        slug: eventSlug,
        organizerId: user?.id || "mock-user-organizer",
        college: {
          name: userInstitution,
          short_name: userInstitution.substring(0, 3).toUpperCase(),
          slug: userInstitution.toLowerCase().replace(/\s+/g, '-'),
          city: "Chennai",
          state: "Tamil Nadu"
        },
        sport: {
          name: sportObj.name,
          icon: sportObj.icon,
          color: sportObj.color
        },
        eventDate: new Date(formData.eventDate).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        mode: "offline",
        fee: Number(formData.fee),
        posterUrl: formData.posterUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
        isLive: instantPublish,
        status: instantPublish ? "approved" : "pending",
        isFeatured: false,
        participantCount: 0,
        level: formData.level,
        registrationUrl: formData.registrationUrl,

        // New fields
        category: formData.category,
        location: formData.location,
        minParticipants: Number(formData.minParticipants),
        maxParticipants: Number(formData.maxParticipants),
        isTeamEvent: formData.isTeamEvent,
        teamSize: formData.isTeamEvent ? Number(formData.teamSize) : 1,
        minTeamSize: formData.isTeamEvent ? Number(formData.minTeamSize) : 1,
        maxTeamSize: formData.isTeamEvent ? Number(formData.maxTeamSize) : 1,

        prizePool: Number(formData.prizePool),
        prizeFirst: formData.prizeFirst,
        prizeSecond: formData.prizeSecond,
        prizeThird: formData.prizeThird,
        rewardsAdditional: formData.rewardsAdditional,
        trophyInfo: formData.trophyInfo,
        certificateInfo: formData.certificateInfo,

        rules: formData.rules,
        eligibility: formData.eligibility,
        rulesTeam: formData.rulesTeam,
        equipmentRequirements: formData.equipmentRequirements,
        conductRules: formData.conductRules,
        disqualificationConditions: formData.disqualificationConditions,

        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactAlternatePhone: formData.contactAlternatePhone,
        collegeName: userInstitution,
        rulebookUrl: "",
        brochureUrl: ""
      };

      await addEvent(newEventData as any);

      alert("Event created and published successfully!");
      router.push("/tournaments");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An unexpected error occurred while creating the event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight mb-2">Create New Event</h1>
        <p className="text-slate-500 font-medium">Fill in the details to host your sports tournament</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#6B46C1] rounded-full z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>

          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div 
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 font-bold border-4 border-[#F4F4F9]",
                    isActive ? "bg-[#6B46C1] text-white shadow-lg shadow-[#6B46C1]/30 scale-110" : 
                    isCompleted ? "bg-[#6B46C1] text-white" : "bg-white text-slate-400 border-slate-200"
                  )}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider hidden md:block absolute -bottom-8 w-24 text-center",
                  isActive ? "text-[#6B46C1]" : "text-slate-400"
                )}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="surface p-6 sm:p-10 shadow-lg border border-slate-200 mt-12 sm:mt-0 relative overflow-hidden rounded-2xl bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-bold text-[#111827] mb-4">Basic Details & Schedule</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">Event Title <span className="text-[#EF4444]">*</span></label>
                    <input 
                      type="text" 
                      className="input w-full px-4 py-2.5" 
                      placeholder="e.g. Inter-College Cricket Championship 2025"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Sport Category <span className="text-[#EF4444]">*</span></label>
                      <select 
                        className="input w-full px-4 py-2.5"
                        value={formData.sportSlug}
                        onChange={e => setFormData({...formData, sportSlug: e.target.value})}
                        required
                      >
                        <option value="">Select a sport...</option>
                        {SPORTS.map(s => (
                          <option key={s.slug} value={s.slug}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Sport Type / Category</label>
                      <select 
                        className="input w-full px-4 py-2.5"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Venue / Location <span className="text-[#EF4444]">*</span></label>
                      <input 
                        type="text" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. Football Stadium Main Ground"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Event Level</label>
                      <select 
                        className="input w-full px-4 py-2.5"
                        value={formData.level}
                        onChange={e => setFormData({...formData, level: e.target.value})}
                      >
                        <option value="college">Intra-College</option>
                        <option value="zonal">Zonal Level</option>
                        <option value="state">State Level</option>
                        <option value="national">National Level</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Start Date & Time <span className="text-[#EF4444]">*</span></label>
                      <input 
                        type="datetime-local" 
                        className="input w-full px-4 py-2.5"
                        value={formData.eventDate}
                        min={formData.registrationDeadline ? getMinEventDate() : getTodayStartDateTimeString()}
                        onChange={e => {
                          const newDate = e.target.value;
                          setFormData({...formData, eventDate: newDate});
                          validateDates(newDate, formData.registrationDeadline);
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Registration Deadline <span className="text-[#EF4444]">*</span></label>
                      <input 
                        type="datetime-local" 
                        className="input w-full px-4 py-2.5"
                        value={formData.registrationDeadline}
                        min={getTodayStartDateTimeString()}
                        max={getMaxRegDeadline()}
                        onChange={e => {
                          const newDate = e.target.value;
                          setFormData({...formData, registrationDeadline: newDate});
                          validateDates(formData.eventDate, newDate);
                        }}
                        required
                      />
                    </div>
                  </div>
                  {dateError && (
                    <p className="text-red-500 text-sm font-medium mt-1">{dateError}</p>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">Description</label>
                    <textarea 
                      className="input w-full px-4 py-2.5 min-h-[80px]" 
                      placeholder="Describe your event, guidelines, etc..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">Event Poster Image</label>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp, image/jpg" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#6B46C1] hover:bg-[#6B46C1]/5 transition-colors cursor-pointer bg-slate-50 relative overflow-hidden"
                    >
                      {formData.posterUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={formData.posterUrl} alt="Poster preview" className="max-h-[140px] rounded-lg object-contain shadow-md" />
                          <p className="text-xs text-slate-500 font-bold">Click to change poster image</p>
                        </div>
                      ) : (
                        <div className="pointer-events-none">
                          <Upload className="w-6 h-6 text-[#6B46C1] mx-auto mb-2" />
                          <p className="text-[#111827] font-bold text-sm">Click to upload poster</p>
                          <p className="text-xs text-slate-500">SVG, PNG, JPG or WebP (max. 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Participants */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-bold text-[#111827] mb-4">Participant Settings</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Minimum Participants</label>
                      <input 
                        type="number" 
                        className="input w-full px-4 py-2.5" 
                        min="1"
                        value={formData.minParticipants}
                        onChange={e => setFormData({...formData, minParticipants: Math.max(1, Number(e.target.value))})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Maximum Capacity Limit (Max Participants)</label>
                      <input 
                        type="number" 
                        className="input w-full px-4 py-2.5" 
                        min="1"
                        value={formData.maxParticipants}
                        onChange={e => setFormData({...formData, maxParticipants: Math.max(1, Number(e.target.value))})}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-bold text-[#111827]">Team Event</label>
                        <p className="text-xs text-slate-500">Toggle if this is a team-based event instead of individual registration.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-[#6B46C1]"
                        checked={formData.isTeamEvent}
                        onChange={e => setFormData({...formData, isTeamEvent: e.target.checked})}
                      />
                    </div>

                    {formData.isTeamEvent && (
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Min Team Size</label>
                          <input 
                            type="number" 
                            className="input w-full px-3 py-1.5 text-sm"
                            min="1"
                            value={formData.minTeamSize}
                            onChange={e => setFormData({...formData, minTeamSize: Math.max(1, Number(e.target.value))})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Max Team Size</label>
                          <input 
                            type="number" 
                            className="input w-full px-3 py-1.5 text-sm"
                            min="1"
                            value={formData.maxTeamSize}
                            onChange={e => setFormData({...formData, maxTeamSize: Math.max(1, Number(e.target.value))})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Size</label>
                          <input 
                            type="number" 
                            className="input w-full px-3 py-1.5 text-sm"
                            min="1"
                            value={formData.teamSize}
                            onChange={e => setFormData({...formData, teamSize: Math.max(1, Number(e.target.value))})}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Registration Fee (₹)</label>
                      <input 
                        type="number" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="0 for Free"
                        min="0"
                        value={formData.fee}
                        onChange={e => setFormData({...formData, fee: Math.max(0, Number(e.target.value))})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">External Registration Url <span className="text-[#EF4444]">*</span></label>
                      <input 
                        type="url" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. Google Form/External page link"
                        value={formData.registrationUrl}
                        onChange={e => setFormData({...formData, registrationUrl: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Prizes */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-bold text-[#111827] mb-4">Prize Pool & Rewards</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">Total Prize Pool Amount (₹)</label>
                    <input 
                      type="number" 
                      className="input w-full px-4 py-2.5" 
                      placeholder="e.g. 50000"
                      min="0"
                      value={formData.prizePool}
                      onChange={e => setFormData({...formData, prizePool: Math.max(0, Number(e.target.value))})}
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">First Prize (Winner)</label>
                      <input 
                        type="text" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. ₹25,000"
                        value={formData.prizeFirst}
                        onChange={e => setFormData({...formData, prizeFirst: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Second Prize (Runner Up)</label>
                      <input 
                        type="text" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. ₹15,000"
                        value={formData.prizeSecond}
                        onChange={e => setFormData({...formData, prizeSecond: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Third Prize (2nd Runner Up)</label>
                      <input 
                        type="text" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. ₹10,000"
                        value={formData.prizeThird}
                        onChange={e => setFormData({...formData, prizeThird: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Trophy Information</label>
                      <input 
                        type="text" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. Winner Trophy + Runner-up Shield"
                        value={formData.trophyInfo}
                        onChange={e => setFormData({...formData, trophyInfo: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Certificate Information</label>
                      <input 
                        type="text" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. Merit Certificates + Participation E-Certificates"
                        value={formData.certificateInfo}
                        onChange={e => setFormData({...formData, certificateInfo: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">Additional Rewards / Perks</label>
                    <textarea 
                      className="input w-full px-4 py-2.5 min-h-[60px]" 
                      placeholder="e.g. Free lunch tokens, sponsor goodies, etc..."
                      value={formData.rewardsAdditional}
                      onChange={e => setFormData({...formData, rewardsAdditional: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Rules */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-bold text-[#111827] mb-4">Rules & Guidelines</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">Event Rules (Comma/Newline separated)</label>
                    <textarea 
                      className="input w-full px-4 py-2.5 min-h-[80px]" 
                      placeholder="e.g. 15 overs per match. Carrying own gears is mandatory. Decisions of the officials are final."
                      value={formData.rules}
                      onChange={e => setFormData({...formData, rules: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Eligibility Requirements</label>
                      <textarea 
                        className="input w-full px-4 py-2.5 min-h-[70px]" 
                        placeholder="e.g. Only undergraduate students with valid college ID card"
                        value={formData.eligibility}
                        onChange={e => setFormData({...formData, eligibility: e.target.value})}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Team Rules & Substitutions</label>
                      <textarea 
                        className="input w-full px-4 py-2.5 min-h-[70px]" 
                        placeholder="e.g. Max 3 substitutions allowed per match"
                        value={formData.rulesTeam}
                        onChange={e => setFormData({...formData, rulesTeam: e.target.value})}
                      ></textarea>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Equipment Requirements</label>
                      <textarea 
                        className="input w-full px-4 py-2.5 min-h-[70px]" 
                        placeholder="e.g. Spikes allowed. Safety guards/shin pads are mandatory."
                        value={formData.equipmentRequirements}
                        onChange={e => setFormData({...formData, equipmentRequirements: e.target.value})}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Conduct & Disciplinary Rules</label>
                      <textarea 
                        className="input w-full px-4 py-2.5 min-h-[70px]" 
                        placeholder="e.g. Strict code of conduct. Friendly play expected."
                        value={formData.conductRules}
                        onChange={e => setFormData({...formData, conductRules: e.target.value})}
                      ></textarea>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">Disqualification Conditions</label>
                    <textarea 
                      className="input w-full px-4 py-2.5 min-h-[60px]" 
                      placeholder="e.g. Fake identity or age proof. Misbehavior with officials."
                      value={formData.disqualificationConditions}
                      onChange={e => setFormData({...formData, disqualificationConditions: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Contact */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-bold text-[#111827] mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">College Name <span className="text-[#EF4444]">*</span></label>
                      <input 
                        type="text" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. IIT Madras"
                        value={formData.collegeName}
                        onChange={e => setFormData({...formData, collegeName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Organizer Name <span className="text-[#EF4444]">*</span></label>
                      <input 
                        type="text" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. Prof. Kumar / Student Coordinator"
                        value={formData.contactName}
                        onChange={e => setFormData({...formData, contactName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-bold text-[#111827] mb-2">Organizer Phone <span className="text-[#EF4444]">*</span></label>
                      <input 
                        type="tel" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. +91 99999 88888"
                        value={formData.contactPhone}
                        onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-bold text-[#111827] mb-2">Alternate Contact</label>
                      <input 
                        type="tel" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. Secondary coordinator phone"
                        value={formData.contactAlternatePhone}
                        onChange={e => setFormData({...formData, contactAlternatePhone: e.target.value})}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-bold text-[#111827] mb-2">Organizer Email <span className="text-[#EF4444]">*</span></label>
                      <input 
                        type="email" 
                        className="input w-full px-4 py-2.5" 
                        placeholder="e.g. sports@college.edu.in"
                        value={formData.contactEmail}
                        onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-display font-bold text-[#111827]">
                  Ready to Publish
                </h2>
                <p className="text-slate-500 max-w-md mx-auto font-medium mb-6 text-sm">
                  Your event "{formData.title || 'Untitled'}" is configured. Verify key details before deploying it live.
                </p>
                <div className="bg-slate-50 rounded-xl p-5 text-left max-w-md mx-auto border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Sport Category</span>
                    <span className="font-bold text-[#111827] capitalize">{formData.sportSlug || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Venue / Location</span>
                    <span className="font-bold text-[#111827]">{formData.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Max Capacity</span>
                    <span className="font-bold text-[#111827]">{formData.maxParticipants} slots</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Prize Pool</span>
                    <span className="font-bold text-[#111827]">₹{formData.prizePool.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Registration Fee</span>
                    <span className="font-bold text-[#111827]">{formData.fee === 0 ? 'Free' : `₹${formData.fee}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coordinator</span>
                    <span className="font-bold text-[#111827] truncate max-w-[150px]">{formData.contactName || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Form Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <button 
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className="btn-secondary flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          <button 
            type="button"
            onClick={currentStep === STEPS.length ? handleSubmit : handleNext}
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
            ) : currentStep === STEPS.length ? (
              <>"Publish Event"</>
            ) : (
              <>"Next Step" <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
