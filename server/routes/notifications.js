import express from 'express';
import nodemailer from 'nodemailer';
import Bill from '../models/Bill.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email notification for pending bills
router.post('/send-reminder/:billId', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId).populate('items.item');
    
    // Only send notifications for unpaid or partially paid bills
    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }
    
    const pendingAmount = bill.totalAmount - bill.paidAmount;
    
    // Send email to each customer
    for (const customer of bill.customers) {
      if (customer.email) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customer.email,
            subject: 'Payment Reminder - Pending Bill',
            html: `
            <h2>Payment Reminder</h2>
            <p>Dear ${customer.name},</p>
            <p>This is a reminder that you have a pending payment of Rs. ${pendingAmount.toFixed(2)}.</p>
            <h3>Bill Details:</h3>
            <ul>
              ${bill.items.map(item => `
                <li>${item.item.name} - Quantity: ${item.quantity} - Price: Rs. ${(item.item.price * item.quantity).toFixed(2)}</li>
              `).join('')}
            </ul>
            <p>Total Amount: Rs. ${bill.totalAmount.toFixed(2)}</p>
            <p>Paid Amount: Rs. ${bill.paidAmount.toFixed(2)}</p>
            <p>Pending Amount: Rs. ${pendingAmount.toFixed(2)}</p>
            <p>Please make the payment at your earliest convenience.</p>
          `
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
            }
            else {
              console.log("Email sent: " + info.response);
            }
          });
        } catch (error) {
          console.error('Error sending email:', error);
        }
      }
    }
    
    res.json({ message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;