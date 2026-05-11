import { useState } from "react";
import { toast } from "react-hot-toast";
import theme from "../../theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { exportInvoicesCSV } from "../../api/reports";

const Reports = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      toast.loading("Generating report...", { id: "report" });
      await exportInvoicesCSV();
      toast.success("Report downloaded successfully!", { id: "report" });
    } catch {
      toast.error("Failed to download report", { id: "report" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Analytics & Data</p>
        <h2 style={theme.typography.h2} className="text-2xl font-bold text-black tracking-tight">
          Reports
        </h2>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Export Invoices</h3>
            <p className="text-sm text-neutral-light mt-1">Download a comprehensive CSV report of all your invoices, including status and amounts.</p>
          </div>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? "Exporting..." : "Download CSV"}
          </Button>
        </div>
      </Card>
      
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 text-3xl">
            🚧
          </div>
          <h3 className="text-lg font-bold text-white mb-2">More Reports Coming Soon</h3>
          <p className="text-sm text-neutral-light max-w-md mx-auto">
            We are working on adding visual charts, tax summaries, and client revenue breakdowns to this section.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
