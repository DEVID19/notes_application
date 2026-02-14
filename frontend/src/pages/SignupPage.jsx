import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signupUser, clearError } from "../features/auth/authSlice";
import toast from "react-hot-toast";

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signupUser(formData));
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6c63ff 1px, transparent 1px), linear-gradient(90deg, #6c63ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-[#18181f] border border-[#2e2e3e] rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#ff6584] mb-4 flex items-center justify-center">
              <span className="text-white text-xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-white">CollabNotes</h1>
            <p className="text-[#888899] text-sm mt-1">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[#888899] text-xs uppercase tracking-wider font-mono">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="bg-[#0f0f13] border border-[#2e2e3e] rounded-lg px-4 py-3 text-white placeholder-[#555566] focus:outline-none focus:border-[#6c63ff] transition-colors text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#888899] text-xs uppercase tracking-wider font-mono">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="bg-[#0f0f13] border border-[#2e2e3e] rounded-lg px-4 py-3 text-white placeholder-[#555566] focus:outline-none focus:border-[#6c63ff] transition-colors text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#888899] text-xs uppercase tracking-wider font-mono">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-[#0f0f13] border border-[#2e2e3e] rounded-lg px-4 py-3 text-white placeholder-[#555566] focus:outline-none focus:border-[#6c63ff] transition-colors text-sm"
              />
              {/* Hint about password requirements from backend */}
              <p className="text-[#555566] text-xs mt-1 font-mono">
                Min 4 chars · uppercase · lowercase · number · symbol
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#6c63ff] hover:bg-[#5a52e0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[#888899] text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#6c63ff] hover:underline font-medium">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;