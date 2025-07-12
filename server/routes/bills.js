import express from 'express';
import Bill from '../models/Bill.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().populate('items.item');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new bill
router.post('/', async (req, res) => {
  const bill = new Bill(req.body);
  try {
    const newBill = await bill.save();
    res.status(201).json(newBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update bill payment status
router.patch('/:id', async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const bill = await Bill.findById(req.params.id);
    
    bill.paidAmount = paidAmount;
    if (paidAmount >= bill.totalAmount) {
      bill.status = 'paid';
    } else if (paidAmount > 0) {
      bill.status = 'partially-paid';
    } else {
      bill.status = 'unpaid';
    }
    
    const updatedBill = await bill.save();
    res.json(updatedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generate PDF for a bill
router.get('/:id/pdf', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('items.item');
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${bill._id}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(25).text('Bill Details', { align: 'center' });
    doc.moveDown();
    
    // Customer details
    doc.fontSize(14).text('Customer Information:');
    bill.customers.forEach(customer => {
      doc.fontSize(12).text(`Name: ${customer.name}`);
      if (customer.email) doc.text(`Email: ${customer.email}`);
      doc.text(`Mobile: ${customer.mobileNumbers.join(', ')}`);
    });
    
    doc.moveDown();
    
    // Items table
    doc.fontSize(14).text('Items:');
    doc.moveDown();
    bill.items.forEach(item => {
      doc.fontSize(12).text(
        `${item.item.name} - Quantity: ${item.quantity} - Price: ₹${item.item.price * item.quantity}`
      );
    });
    
    doc.moveDown();
    
    // Total amount
    doc.fontSize(14).text(`Total Amount: ₹${bill.totalAmount}`);
    doc.text(`Paid Amount: ₹${bill.paidAmount}`);
    doc.text(`Status: ${bill.status}`);
    if (bill.status === 'partially-paid') {
      doc.text(`Pending Amount: ₹${bill.totalAmount - bill.paidAmount}`);
    }
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;