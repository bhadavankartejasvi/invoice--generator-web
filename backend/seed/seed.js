import { sequelize } from "../src/models/index.js";
import User from "../src/models/user.model.js";
import Client from "../src/models/client.model.js";
import Product from "../src/models/product.model.js";
import Template from "../src/models/template.model.js";
import Invoice from "../src/models/invoice.model.js";
import InvoiceItem from "../src/models/invoiceItem.model.js";
import RecurringInvoice from "../src/models/recurringInvoice.model.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  await sequelize.sync({ force: true });

  const password = await bcrypt.hash("123456", 10);

  await User.create({
    fullName: "Admin User",
    email: "admin@mail.com",
    password
  });

  const clients = await Client.bulkCreate([
    { 
      name: "Client A", 
      email: "a@mail.com",
      phone: "555-0001",
      address: "123 Main St, City A"
    },
    { 
      name: "Client B", 
      email: "b@mail.com",
      phone: "555-0002",
      address: "456 Oak Ave, City B"
    },
    {
      name: "Tech Startup Inc",
      email: "contact@techstartup.com",
      phone: "555-0003",
      address: "789 Tech Park, Silicon Valley"
    }
  ]);

  const products = await Product.bulkCreate([
    { name: "Web Development", sku: "WEB-DEV", description: "Custom web development", price: 5000, tax_rate: 10 },
    { name: "UI/UX Design", sku: "UI-DES", description: "Full UI design suite", price: 3000, tax_rate: 10 },
    { name: "Cloud Hosting (Monthly)", sku: "HOST-M", description: "Monthly secure hosting", price: 500, tax_rate: 5 },
    { name: "API Development", sku: "API-DEV", description: "REST API integration", price: 2000, tax_rate: 10 },
    { name: "Testing & QA", sku: "QA-TEST", description: "Automated test suite", price: 1500, tax_rate: 10 }
  ]);

  const templates = await Template.bulkCreate([
    {
      name: "Modern Professional",
      config: {
        themeColor: "#4f46e5",
        typography: "Inter",
        borderStyle: "Rounded",
        businessName: "Acme Corporation",
        businessAddress: "123 Business Avenue, Suite 100\nSan Francisco, CA 94107",
        disabledFields: ["discount"],
        logoUrl: "",
        signatureUrl: ""
      }
    },
    {
      name: "Modern Green",
      config: {
        themeColor: "#10b981",
        typography: "Roboto",
        borderStyle: "Sharp",
        businessName: "Eco Innovations",
        businessAddress: "456 Green Way\nPortland, OR 97204",
        disabledFields: ["tax"],
        logoUrl: "",
        signatureUrl: ""
      }
    },
    {
      name: "Corporate Red",
      config: {
        accentColor: "#dc2626",
        backgroundColor: "#ffffff",
        fontSize: 12,
        footer: "For questions, please contact us at support@company.com"
      }
    }
  ]);

  // Create sample invoices
  const invoice1 = await Invoice.create({
    client_id: clients[0].id,
    template_id: templates[0].id,
    invoice_number: "INV-2025-0001",
    status: "draft",
    subtotal: 5000,
    tax: 500,
    total: 5500
  });

  await InvoiceItem.bulkCreate([
    {
      invoice_id: invoice1.id,
      product_id: products[0].id,
      quantity: 1,
      price: 5000,
      tax_rate: 10
    }
  ]);

  const invoice2 = await Invoice.create({
    client_id: clients[2].id,
    template_id: templates[1].id,
    invoice_number: "INV-2025-0002",
    status: "finalised",
    subtotal: 8000,
    tax: 800,
    total: 8800
  });

  await InvoiceItem.bulkCreate([
    {
      invoice_id: invoice2.id,
      product_id: products[0].id,
      quantity: 1,
      price: 5000,
      tax_rate: 10
    },
    {
      invoice_id: invoice2.id,
      product_id: products[1].id,
      quantity: 1,
      price: 3000,
      tax_rate: 10
    }
  ]);

  // Create recurring invoice for monthly hosting
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  await RecurringInvoice.create({
    client_id: clients[2].id,
    template_id: templates[1].id,
    interval_type: "monthly",
    next_run: nextMonth,
    source_invoice_id: invoice2.id
  });

  console.log("✅ Seeding completed successfully!");
  console.log("\nSample Data Created:");
  console.log("- 1 Admin User (admin@mail.com / password: 123456)");
  console.log("- 3 Clients");
  console.log("- 5 Products/Services");
  console.log("- 3 Invoice Templates");
  console.log("- 2 Sample Invoices");
  console.log("- 1 Recurring Invoice (Monthly)");
  process.exit();
};

seed();