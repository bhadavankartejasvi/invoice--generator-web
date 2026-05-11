import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../../api/auth";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        setUser(profile);
      } catch {
        setUser(null);
      }
    };

    loadProfile();
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "US";

  return (
    <div className="h-18 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        {user && (
          <div
            className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/app/profile")}
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-sm font-semibold text-slate-700">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.fullName || "User"} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900">{user.fullName || "Profile"}</span>
              <span className="text-[11px] text-slate-500">View profile</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
