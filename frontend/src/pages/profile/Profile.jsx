import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { fetchProfile, updateProfile } from "../../api/auth";
import { getAuditLogs } from "../../api/audits";

const Profile = () => {
  const [profile, setProfile] = useState({ fullName: "", email: "", company: "", phone: "" });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProfileAndLogs = async () => {
    try {
      const data = await fetchProfile();
      setProfile({
        fullName: data.fullName || "",
        email: data.email || "",
        company: data.company || "",
        phone: data.phone || "",
        profilePicture: data.profilePicture || ""
      });
      const logsData = await getAuditLogs();
      setLogs(logsData || []);
    } catch {
      toast.error("Failed to load user profile");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfileAndLogs();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profile);
      toast.success("Profile updated successfully");
      loadProfileAndLogs();
    } catch (err) {
      toast.error(err.message || "Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in-up pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your personal information and security preferences.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Personal Details</h3>
            </div>
            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">{profile.fullName?.substring(0,2).toUpperCase() || 'US'}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Profile Photo</h4>
                  <p className="text-xs text-slate-500 mb-3">Recommended size 400x400px. JPG, GIF or PNG.</p>
                  <div className="flex gap-3">
                    <label className="cursor-pointer text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors">
                      Change
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch("http://localhost:5000/api/upload", {
                              method: "POST",
                              body: formData
                            });
                            const data = await res.json();
                            const url = `http://localhost:5000/uploads/${data.file}`;
                            setProfile(prev => ({ ...prev, profilePicture: url }));
                          } catch {
                            toast.error("Failed to upload image");
                          }
                        }} 
                      />
                    </label>
                    <button type="button" onClick={() => setProfile(prev => ({...prev, profilePicture: ""}))} className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors">Remove</button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Input label="Full Name" name="fullName" value={profile.fullName} onChange={handleChange} required />
                <Input label="Email Address" name="email" type="email" value={profile.email} onChange={handleChange} required />
                <Input label="Company Name" name="company" value={profile.company} onChange={handleChange} />
                <Input label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
               <h3 className="font-bold text-slate-900 text-sm">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
                {logs.length > 0 ? logs.slice(0,10).map((log, index) => (
                  <div key={log.id || index} className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3 h-3 bg-white border-2 border-slate-300 rounded-full"></div>
                    <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">No recent activity.</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
