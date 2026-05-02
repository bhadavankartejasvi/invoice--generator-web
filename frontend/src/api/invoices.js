import api from "./axiosClient";

export const getInvoices = (search = "") => api.get(`/invoices${search ? `?search=${encodeURIComponent(search)}` : ""}`).then((res) => res.data);
export const createInvoice = (payload) => api.post("/invoices", payload).then((res) => res.data);
export const getInvoiceById = (id) => api.get(`/invoices/${id}`).then((res) => res.data);
export const updateStatus = (id, status) => api.patch(`/invoices/${id}/status`, { status }).then((res) => res.data);
export const sendInvoiceEmail = (id, email) => api.post(`/invoices/${id}/send`, { email }).then((res) => res.data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`).then((res) => res.data);

// Using native fetch for blob response since axios default setup might not handle blobs smoothly for download
export const downloadInvoicePDF = (id) => {
  return api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
};
