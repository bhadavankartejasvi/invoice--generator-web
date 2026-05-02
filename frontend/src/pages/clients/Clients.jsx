import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { getClients, createClient, updateClient, deleteClient } from "../../api/clients";

const initialClient = { name: "", company: "", email: "", phone: "", address: "" };

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState(initialClient);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [invoices, setInvoices] = useState([]);

  const loadData = async (query = "") => {
    try {
      const [clientsData, invoicesData] = await Promise.all([
        getClients(query),
        import("../../api/invoices").then(m => m.getInvoices())
      ]);
      setClients(clientsData);
      setInvoices(invoicesData);
    } catch {
      toast.error("Failed to load data");
      setClients([]);
      setInvoices([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData(search);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Calculate stats
  const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  const activeProjectsCount = invoices.filter(inv => inv.status === 'pending').length;

  const handleOpen = (client = null) => {
    setSelectedClient(client);
    setFormData(client ? { ...client } : initialClient);
    setOpenModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id || selectedClient._id, formData);
        toast.success("Client updated successfully");
      } else {
        await createClient(formData);
        toast.success("Client created successfully");
      }
      setOpenModal(false);
      loadData(search);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Unable to save client.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      await deleteClient(client.id || client._id);
      toast.success("Client deleted");
      loadData(search);
    } catch {
      toast.error("Failed to delete client");
    }
  };

  const columns = useMemo(
    () => [
      { 
        key: "name", 
        label: "Client Name",
        render: (client) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              {client.name?.substring(0,2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-none">{client.company || client.name}</p>
              {client.company && <p className="text-[11px] text-slate-500 mt-0.5">{client.name}</p>}
            </div>
          </div>
        )
      },
      { key: "email", label: "Email Address" },
      { key: "phone", label: "Phone" },
      { 
        key: "address", 
        label: "Address",
        render: (client) => <span className="text-slate-600 truncate max-w-xs block">{client.address || "—"}</span>
      },
      { 
        key: "status", 
        label: "Status",
        render: () => <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
      },
      {
        key: "actions",
        label: "Actions",
        render: (client) => (
          <div className="flex flex-wrap gap-2">
            <button className="text-slate-400 hover:text-indigo-600 transition" onClick={() => handleOpen(client)}>
              Edit
            </button>
            <span className="text-slate-300">|</span>
            <button className="text-slate-400 hover:text-rose-600 transition" onClick={() => handleDelete(client)}>
              Delete
            </button>
          </div>
        )
      }
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your business relationships and tracking billing history.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleOpen()}>+ Add Client</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Clients</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-slate-900">{clients.length}</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Billed</p>
          <p className="text-3xl font-bold text-slate-900">${totalBilled.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <span className="absolute top-4 right-4 text-[9px] font-bold text-slate-400 uppercase">Across all time</span>
        </Card>
        <Card className="flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Projects</p>
          <p className="text-3xl font-bold text-slate-900">{activeProjectsCount}</p>
          <span className="absolute top-4 right-4 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">Pending Invoices</span>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              Filters
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
              Last 30 Days
            </button>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
          </div>
        </div>
        <Table columns={columns} data={clients.map((client) => ({
          ...client,
          id: client.id || client._id
        }))} />
      </Card>

      <Modal
        open={openModal}
        title={selectedClient ? "Edit Client" : "Add Client"}
        description="Manage customer information and notes."
        onClose={() => setOpenModal(false)}
        footer={
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSubmit} disabled={loading}>{selectedClient ? "Update Client" : "Save Client"}</Button>
            <Button variant="secondary" onClick={() => setOpenModal(false)}>Cancel</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="Company" name="company" value={formData.company} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;
