import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import AuthLayout from "../../components/auth/AuthLayout";
import { register } from "../../api/auth";
import toast from "react-hot-toast";

const registerSchema = yup.object().shape({
  fullName: yup.string().min(2, "Full name must be at least 2 characters").required("Full name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
});

const Register = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await registerSchema.validate(form, { abortEarly: false });
      const response = await register(form);
      localStorage.setItem("token", response.token || response.accessToken || "");
      toast.success("Account created successfully!");
      navigate("/app/dashboard");
    } catch (err) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else {
        setError(err.message || "Unable to create account. Please try again.");
      }
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
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-12 pr-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20.5C6.5 20.5 2.29 16.73 1 12c.82-2.3 2.25-4.28 4.15-5.66" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4.5-7 11-7 11 7 11 7-4.5 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
    </AuthLayout>
  );
};

export default Register;