import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import theme from "../../theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { getRecurringInvoices, createRecurringInvoice, deleteRecurringInvoice } from "../../api/recurring";

const RecurringInvoices = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ invoiceId: "", frequency: "monthly", startDate: "", endDate: "" });

  const loadSchedules = async () => {
    try {
      const data = await getRecurringInvoices();
      setSchedules(data);
    } catch {
      toast.error("Failed to load recurring schedules.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSchedules();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRecurringInvoice(formData);
      toast.success("Recurring schedule created");
      setOpenModal(false);
      setFormData({ invoiceId: "", frequency: "monthly", startDate: "", endDate: "" });
      loadSchedules();
    } catch {
      toast.error("Failed to create schedule.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this recurring schedule?")) return;
    try {
      await deleteRecurringInvoice(id);
      toast.success("Schedule cancelled");
      loadSchedules();
    } catch {
      toast.error("Failed to cancel schedule.");
    }
  };

  const columns = useMemo(() => [
    { key: "invoiceId", label: "Source Invoice", render: (s) => s.Invoice?.invoice_number || `ID: ${s.invoiceId}` },
    { key: "frequency", label: "Frequency", render: (s) => <span className="capitalize font-semibold text-indigo-400">{s.frequency}</span> },
    { key: "startDate", label: "Start Date", render: (s) => new Date(s.startDate).toLocaleDateString() },
    { key: "endDate", label: "End Date", render: (s) => s.endDate ? new Date(s.endDate).toLocaleDateString() : "Ongoing" },
    { key: "status", label: "Status", render: (s) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
        {s.status.toUpperCase()}
      </span>
    )},
    { key: "actions", label: "Actions", render: (s) => (
      <button onClick={() => handleDelete(s.id)} className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 transition">
        Cancel
      </button>
    )}
  ], []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Automation</p>
          <h2 style={theme.typography.h2} className="text-2xl font-bold text-white tracking-tight">Recurring Invoices</h2>
        </div>
        <Button onClick={() => setOpenModal(true)}>New Schedule</Button>
      </div>

      <Card>
        <div className="mb-6">
          <p className="text-sm text-neutral-light">Automate your billing by scheduling invoices to be generated repeatedly.</p>
        </div>
        <Table columns={columns} data={schedules} />
      </Card>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Setup Recurring Invoice" footer={
        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Create Schedule"}</Button>
          <Button variant="secondary" onClick={() => setOpenModal(false)}>Close</Button>
        </div>
      }>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Source Invoice ID" name="invoiceId" value={formData.invoiceId} onChange={handleChange} required placeholder="Numeric ID of template invoice" />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-dark">Frequency</label>
            <select name="frequency" value={formData.frequency} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none">
              <option value="daily" className="bg-slate-800">Daily</option>
              <option value="weekly" className="bg-slate-800">Weekly</option>
              <option value="monthly" className="bg-slate-800">Monthly</option>
              <option value="yearly" className="bg-slate-800">Yearly</option>
            </select>
          </div>
          <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          <Input label="End Date (Optional)" type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </form>
      </Modal>
    </div>
  );
};

export default RecurringInvoices;
