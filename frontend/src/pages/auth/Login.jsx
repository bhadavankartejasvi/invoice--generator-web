import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthFooter from "../../components/auth/AuthFooter";
import { login } from "../../api/auth";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(form);
      localStorage.setItem("token", response.token || response.accessToken || "");
      toast.success("Login successful!");
      navigate("/app/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      {/* HEADER WITH ICON LOGO */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-2xl">FP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            FinPrecision
          </h1>
        </div>

        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
          Enterprise Finance Solutions
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-3xl p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

        <h2 className="text-2xl font-bold mb-2 text-slate-900 tracking-tight">
          Welcome back
        </h2>

        <p className="text-sm text-slate-500 mb-8">
          Access your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* EMAIL */}
          <div>
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              required
            />
          </div>

          {/* REMEMBER + FORGOT */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-offset-0 transition-colors cursor-pointer" />
              <span className="group-hover:text-slate-900 transition-colors font-medium">Remember me</span>
            </label>

            <Link to="/forgot-password" className="text-indigo-600 cursor-pointer hover:text-indigo-800 font-semibold transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 rounded-xl bg-slate-900 text-white font-bold tracking-wide hover:bg-slate-800 transition-all shadow-sm active:translate-y-0 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Secure Login"}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">Sign up</Link>
        </p>
      </div>

      {/* FOOTER */}
      <AuthFooter />

    </AuthLayout>
  );
};

export default Login;