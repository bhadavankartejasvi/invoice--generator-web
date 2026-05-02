import sequelize from "./config/db.js";
import "./models/index.js";
import { User, Client, Product, Template, Invoice, InvoiceItem, AuditLog } from "./models/index.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Reset DB

    console.log("Seeding User...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await User.create({
      fullName: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      company: "Acme Corp",
      phone: "123-456-7890"
    });

    console.log("Seeding Clients...");
    const client1 = await Client.create({
      name: "John Doe",
      company: "Doe Industries",
      email: "john@example.com",
      phone: "111-222-3333",
      address: "123 Doe Street, CA"
    });
    
    const client2 = await Client.create({
      name: "Jane Smith",
      company: "Smith LLC",
      email: "jane@example.com",
      phone: "999-888-7777",
      address: "456 Smith Avenue, NY"
    });

    console.log("Seeding Products...");
    const product1 = await Product.create({
      name: "Web Development",
      sku: "WEB-DEV",
      description: "Custom web application development",
      price: 1500.00
    });
    
    const product2 = await Product.create({
      name: "SEO Services",
      sku: "SEO-SVC",
      description: "Monthly SEO optimization",
      price: 500.00
    });

    console.log("Seeding Templates...");
    const template1 = await Template.create({
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
    });

    console.log("Seeding Invoices...");
    const invoice1 = await Invoice.create({
      invoice_number: "INV-001",
      client_id: client1.id,
      template_id: template1.id,
      subtotal: 2000.00,
      tax: 200.00,
      total_amount: 2200.00,
      currency: "USD",
      status: "finalised",
      notes: "Thank you for your business!"
    });

    await InvoiceItem.create({
      invoice_id: invoice1.id,
      product_id: product1.id,
      description: product1.name,
      quantity: 1,
      price: product1.price
    });

    await InvoiceItem.create({
      invoice_id: invoice1.id,
      product_id: product2.id,
      description: product2.name,
      quantity: 1,
      price: product2.price
    });

    console.log("Seeding Audit Log...");
    await AuditLog.create({
      user_id: user.id,
      action: "Created initial invoice INV-001",
      details: { invoiceId: invoice1.id }
    });

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
