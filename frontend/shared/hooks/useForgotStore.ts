import { create } from "zustand";

type Step = "forgot" | "otp" | "reset";

interface ForgotStore {
  step: Step;
  email: string | null;
  setStep: (step: Step) => void;
  setEmail: (email: string) => void;
  reset: () => void;
}

export const useForgotStore = create<ForgotStore>((set) => ({
  step: "forgot",
  email: null,
  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  reset: () => set({ step: "forgot", email: null }),
}));
