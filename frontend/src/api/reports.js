import api from "./axiosClient";

export const exportInvoicesCSV = () => api.get("/reports/invoices", { responseType: 'blob' })
  .then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
