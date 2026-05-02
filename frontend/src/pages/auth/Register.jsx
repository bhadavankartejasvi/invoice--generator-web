import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthFooter from "../../components/auth/AuthFooter";
import { register } from "../../api/auth";

const Register = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await register(form);
      localStorage.setItem("token", response.token || response.accessToken || "");
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message || "Unable to create account. Please try again.");
    }
  };

  return (
    <AuthLayout>
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

      <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-3xl p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-2xl font-bold mb-2 text-slate-900 tracking-tight">
          Create Account
        </h2>
        <p className="text-sm text-slate-500 mb-8">Set up your finance workspace and start sending invoices.</p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">Full Name</label>
            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              required
            />
          </div>

          {error && <p className="text-sm text-rose-500 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}

          <button type="submit" className="w-full h-12 mt-4 rounded-xl bg-slate-900 text-white font-bold tracking-wide hover:bg-slate-800 transition-all shadow-sm active:translate-y-0">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Already registered? <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold ml-1">Log in</Link>
        </p>
      </div>
      <AuthFooter />
    </AuthLayout>
  );
};

export default Register;