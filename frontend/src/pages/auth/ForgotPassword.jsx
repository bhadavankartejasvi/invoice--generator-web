// import { useState } from "react";
// import { Link } from "react-router-dom";
// import AuthLayout from "../../components/auth/AuthLayout";

// import theme from "../../theme";
// import { forgotPassword } from "../../api/auth";

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     setError("");
//     try {
//       const res = await forgotPassword({ email });
//       setMessage(res.message || "Password reset link sent to your email.");
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Failed to send reset link.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthLayout>
//     <div className="text-center mb-10 animate-fade-in-up">
//         <div className="flex items-center justify-center gap-3 mb-3">
//           <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
//             <span className="text-white font-bold text-2xl">FP</span>
//           </div>
//           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
//             FinPrecision
//           </h1>
//         </div>

//         <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
//           Enterprise Finance Solutions
//         </p>
//       </div>

//       <div className="w-full max-w-md glass-card rounded-3xl p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
//         <h2 style={theme.typography.h2} className="mb-2 text-white">
//           Forgot Password
//         </h2>
//         <p className="text-sm text-neutral-light mb-8">
//           Enter your email to receive a password reset link.
//         </p>

//         {message && (
//           <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium rounded-xl text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
//             {message}
//           </div>
//         )}
//         {error && (
//           <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-rose-400 font-medium rounded-xl text-sm shadow-[0_0_15px_rgba(244,63,94,0.1)]">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="text-xs font-bold tracking-wide text-neutral-light uppercase mb-2 block">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="name@company.com"
//               className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full h-12 mt-4 rounded-xl bg-slate-900 text-white font-bold tracking-wide hover:bg-slate-800 transition-all shadow-sm active:translate-y-0 disabled:opacity-50"
//           >
//             {loading ? "Sending..." : "Send Reset Link"}
//           </button>
//         </form>

//         <div className="mt-8 text-center text-sm text-slate-400">
//           Remember your password?{" "}
//           <Link to="/" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
//             Back to login
//           </Link>
//         </div>
//       </div>

//     </AuthLayout>
//   );
// };

// export default ForgotPassword;
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
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

      setMessage(
        res.message || "Password reset link sent to your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      {/* HEADER */}
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

      {/* CARD */}
      <div
        className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-3xl p-8 animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >

        <h2 className="text-2xl font-bold mb-2 text-slate-900 tracking-tight">
          Forgot Password
        </h2>

        <p className="text-sm text-slate-500 mb-8">
          Enter your email to receive a password reset link.
        </p>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* EMAIL */}
          <div>
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 rounded-xl bg-slate-900 text-white font-bold tracking-wide hover:bg-slate-800 transition-all shadow-sm active:translate-y-0 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
          Remember your password?{" "}
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Back to login
          </Link>
        </div>
      </div>

    </AuthLayout>
  );
};

export default ForgotPassword;