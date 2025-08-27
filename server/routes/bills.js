import express from "express";
import Bill from "../models/Bill.js";
import PDFDocument from "pdfkit";

const router = express.Router();

/**
 * Utility: Handle async route errors
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Utility: Update bill payment status
 */
const updatePaymentStatus = (bill, paidAmount) => {
  bill.paidAmount = paidAmount;

  if (paidAmount >= bill.totalAmount) {
    bill.status = "paid";
  } else if (paidAmount > 0) {
    bill.status = "partially-paid";
  } else {
    bill.status = "unpaid";
  }
  return bill;
};

/**
 * GET / - Fetch all bills
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const bills = await Bill.find().populate("items.item");
    res.json(bills);
  })
);

/**
 * POST / - Create new bill
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const bill = new Bill(req.body);
    const newBill = await bill.save();
    res.status(201).json(newBill);
  })
);

/**
 * PATCH /:id - Update bill payment status
 */
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { paidAmount } = req.body;
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    updatePaymentStatus(bill, paidAmount);
    const updatedBill = await bill.save();

    res.json(updatedBill);
  })
);

/**
 * GET /:id/pdf - Generate PDF for a bill
 */
router.get(
  "/:id/pdf",
  asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id).populate("items.item");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const doc = new PDFDocument();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bill-${bill._id}.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(25).text("Bill Details", { align: "center" }).moveDown();

    // Customer info
    doc.fontSize(14).text("Customer Information:");
    bill.customers.forEach(({ name, email, mobileNumbers }) => {
      doc
        .fontSize(12)
        .text(`Name: ${name}`)
        .text(email ? `Email: ${email}` : "")
        .text(`Mobile: ${mobileNumbers.join(", ")}`)
        .moveDown(0.5);
    });

    // Items
    doc.moveDown().fontSize(14).text("Items:").moveDown();
    bill.items.forEach(({ item, quantity }) => {
      doc
        .fontSize(12)
        .text(
          `${item.name} - Quantity: ${quantity} - Price: ₹${item.price * quantity}`
        );
    });

    // Bill summary
    doc.moveDown();
    doc
      .fontSize(14)
      .text(`Total Amount: ₹${bill.totalAmount}`)
      .text(`Paid Amount: ₹${bill.paidAmount}`)
      .text(`Status: ${bill.status}`);

    if (bill.status === "partially-paid") {
      doc.text(`Pending Amount: ₹${bill.totalAmount - bill.paidAmount}`);
    }

    // End PDF
    doc.end();
  })
);

/**
 * Global error handler
 */
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Server Error" });
});

export default router;
