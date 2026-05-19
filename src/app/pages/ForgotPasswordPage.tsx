import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Lock, Mail, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { authApi } from "../../lib/api";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  // Steps: 1 = Request OTP, 2 = Verify OTP, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please enter your GX ID or email.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword({ identifier });
      toast.success("OTP sent to your registered email");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please check your identifier.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await authApi.verifyOtp({ identifier, otp });
      toast.success("OTP verified successfully");
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ identifier, otp, newPassword });
      toast.success("Password has been reset successfully");
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 to-transparent -z-10"></div>
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 -right-64 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-white py-10 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl border border-slate-100/60 relative backdrop-blur-xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">GlobXplore</span>
            </div>
          </div>

          <div className="mb-8 text-left">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              {step === 1 && "Reset your password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Set new password"}
              {step === 4 && "Password Reset Complete"}
            </h2>
            <p className="text-slate-500 font-medium tracking-wide text-sm">
              {step === 1 && "Enter your GX ID or email address and we'll send you an OTP to reset your password."}
              {step === 2 && "Enter the 6-digit code sent to your email address."}
              {step === 3 && "Choose a strong password to secure your account."}
              {step === 4 && "You can now log in with your new password."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 flex items-start gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-red-700 text-sm font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* STEP 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                <label className="text-sm font-semibold text-slate-700 block" htmlFor="identifier">
                  GX ID or Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <User className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm font-medium"
                    placeholder="e.g. GXCO123456 or name@example.com"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-px"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Send OTP</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                <label className="text-sm font-semibold text-slate-700 block" htmlFor="otp">
                  6-Digit OTP
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm font-medium tracking-widest"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 group relative flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Verify OTP</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                <label className="text-sm font-semibold text-slate-700 block" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                <label className="text-sm font-semibold text-slate-700 block" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-px"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]"
              >
                Return to Login
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          {step < 4 && (
            <div className="mt-8 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
