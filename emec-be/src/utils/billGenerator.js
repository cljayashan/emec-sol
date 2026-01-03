import PDFDocument from 'pdfkit';
import pool from '../config/database.js';

export const generatePurchaseBillPDF = async (purchaseBillId) => {
  try {
    // Fetch purchase bill data
    const [bills] = await pool.execute(
      `SELECT pb.*, s.name as supplier_name 
       FROM purchase_bills pb 
       LEFT JOIN suppliers s ON pb.supplier_id = s.id 
       WHERE pb.id = ?`,
      [purchaseBillId]
    );

    if (bills.length === 0) {
      throw new Error('Purchase bill not found');
    }

    const bill = bills[0];

    // Fetch purchase bill items
    const [items] = await pool.execute(
      `SELECT pbi.*, i.item_name, i.brand, i.measurement_unit 
       FROM purchase_bill_items pbi 
       LEFT JOIN items i ON pbi.item_id = i.id 
       WHERE pbi.purchase_bill_id = ?`,
      [purchaseBillId]
    );

    // Fetch bill template
    const [templates] = await pool.execute(
      `SELECT * FROM bill_templates WHERE template_type = 'purchase' AND is_active = 1 LIMIT 1`
    );

    const template = templates.length > 0 ? templates[0] : null;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});

    // Header
    if (template) {
      if (template.company_name) {
        doc.fontSize(20).text(template.company_name, { align: 'center' });
      }
      if (template.motto) {
        doc.fontSize(12).text(template.motto, { align: 'center' });
      }
      if (template.address) {
        doc.fontSize(10).text(template.address, { align: 'center' });
      }
      if (template.phone_numbers) {
        doc.fontSize(10).text(`Phone: ${template.phone_numbers}`, { align: 'center' });
      }
      if (template.email) {
        doc.fontSize(10).text(`Email: ${template.email}`, { align: 'center' });
      }
      doc.moveDown();
    }

    // Title
    doc.fontSize(16).text('PURCHASE BILL', { align: 'center' });
    doc.moveDown();

    // Bill details
    doc.fontSize(10);
    doc.text(`Bill Number: ${bill.bill_number}`);
    doc.text(`Date: ${new Date(bill.purchase_date).toLocaleDateString()}`);
    doc.text(`Supplier: ${bill.supplier_name || 'N/A'}`);
    doc.moveDown();

    // Items table
    let yPos = doc.y;
    doc.fontSize(10);
    doc.text('Item', 50, yPos);
    doc.text('Batch', 200, yPos);
    doc.text('Qty', 280, yPos);
    doc.text('Free Qty', 330, yPos);
    doc.text('Unit Price', 400, yPos);
    doc.text('Total', 480, yPos);

    yPos += 20;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

    items.forEach((item, index) => {
      yPos += 20;
      doc.text(item.item_name || 'N/A', 50, yPos);
      doc.text(item.batch_number || 'N/A', 200, yPos);
      doc.text(item.quantity.toString(), 280, yPos);
      doc.text(item.free_quantity.toString(), 330, yPos);
      doc.text(item.unit_price.toString(), 400, yPos);
      doc.text(item.total_price.toString(), 480, yPos);
    });

    yPos += 30;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 10;
    doc.fontSize(12).text(`Total Amount: ${bill.total_amount}`, 400, yPos);

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  } catch (error) {
    throw error;
  }
};

export const generateSaleBillPDF = async (saleBillId) => {
  try {
    // Fetch sale bill data
    const [bills] = await pool.execute(
      `SELECT * FROM sale_bills WHERE id = ?`,
      [saleBillId]
    );

    if (bills.length === 0) {
      throw new Error('Sale bill not found');
    }

    const bill = bills[0];

    // Fetch sale bill items
    const [items] = await pool.execute(
      `SELECT sbi.*, i.item_name, i.brand, i.measurement_unit 
       FROM sale_bill_items sbi 
       LEFT JOIN items i ON sbi.item_id = i.id 
       WHERE sbi.sale_bill_id = ?`,
      [saleBillId]
    );

    // Fetch payment details
    const [payments] = await pool.execute(
      `SELECT * FROM payment_details WHERE sale_bill_id = ?`,
      [saleBillId]
    );

    // Fetch bill template
    const [templates] = await pool.execute(
      `SELECT * FROM bill_templates WHERE template_type = 'sale' AND is_active = 1 LIMIT 1`
    );

    const template = templates.length > 0 ? templates[0] : null;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});

    // Header (same as purchase bill)
    if (template) {
      if (template.company_name) {
        doc.fontSize(20).text(template.company_name, { align: 'center' });
      }
      if (template.motto) {
        doc.fontSize(12).text(template.motto, { align: 'center' });
      }
      if (template.address) {
        doc.fontSize(10).text(template.address, { align: 'center' });
      }
      if (template.phone_numbers) {
        doc.fontSize(10).text(`Phone: ${template.phone_numbers}`, { align: 'center' });
      }
      if (template.email) {
        doc.fontSize(10).text(`Email: ${template.email}`, { align: 'center' });
      }
      doc.moveDown();
    }

    // Title
    doc.fontSize(16).text('SALE BILL', { align: 'center' });
    doc.moveDown();

    // Bill details
    doc.fontSize(10);
    doc.text(`Bill Number: ${bill.bill_number}`);
    doc.text(`Date: ${new Date(bill.sale_date).toLocaleDateString()}`);
    doc.moveDown();

    // Items table
    let yPos = doc.y;
    doc.fontSize(10);
    doc.text('Item', 50, yPos);
    doc.text('Qty', 200, yPos);
    doc.text('Unit Price', 250, yPos);
    doc.text('Labour', 330, yPos);
    doc.text('Total', 400, yPos);

    yPos += 20;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

    items.forEach((item) => {
      yPos += 20;
      doc.text(item.item_name || 'N/A', 50, yPos);
      doc.text(item.quantity.toString(), 200, yPos);
      doc.text(item.unit_price.toString(), 250, yPos);
      doc.text(item.labour_charge.toString(), 330, yPos);
      doc.text(item.total_price.toString(), 400, yPos);
    });

    yPos += 30;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 10;
    doc.fontSize(10).text(`Subtotal: ${bill.subtotal}`, 400, yPos);
    yPos += 15;
    doc.text(`Labour Charge: ${bill.labour_charge}`, 400, yPos);
    yPos += 15;
    doc.text(`Discount: ${bill.discount}`, 400, yPos);
    yPos += 15;
    doc.fontSize(12).text(`Total Amount: ${bill.total_amount}`, 400, yPos);

    // Payment details
    if (payments.length > 0) {
      yPos += 30;
      doc.fontSize(10).text('Payment Details:', 50, yPos);
      payments.forEach((payment) => {
        yPos += 15;
        doc.text(`Method: ${payment.payment_method}`, 50, yPos);
        doc.text(`Amount: ${payment.amount}`, 200, yPos);
        if (payment.reference_number) {
          doc.text(`Ref: ${payment.reference_number}`, 300, yPos);
        }
      });
    }

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  } catch (error) {
    throw error;
  }
};

