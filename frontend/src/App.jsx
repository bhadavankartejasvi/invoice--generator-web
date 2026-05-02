import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import "./styles/globals.css";

function App() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <AppRoutes />
    </div>
  );
}

export default App;