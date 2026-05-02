import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthFooter from "../../components/auth/AuthFooter";
import theme from "../../theme";
import { forgotPassword } from "../../api/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await forgotPassword({ email });
      setMessage(res.message || "Password reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 style={theme.typography.h1} className="font-bold text-white tracking-tight">
            FinPrecision
          </h1>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-bold">
          Enterprise Finance Solutions
        </p>
      </div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 style={theme.typography.h2} className="mb-2 text-white">
          Forgot Password
        </h2>
        <p className="text-sm text-neutral-light mb-8">
          Enter your email to receive a password reset link.
        </p>

        {message && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium rounded-xl text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-rose-400 font-medium rounded-xl text-sm shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold tracking-wide text-neutral-light uppercase mb-2 block">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold tracking-wide hover:from-indigo-400 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Remember your password?{" "}
          <Link to="/" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
            Back to login
          </Link>
        </div>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default ForgotPassword;
