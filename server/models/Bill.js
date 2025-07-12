import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: String,
  mobileNumbers: [{
    type: String,
    required: true
  }]
});

const billSchema = new mongoose.Schema({
  customers: [customerSchema],
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'partially-paid'],
    default: 'unpaid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Bill', billSchema);