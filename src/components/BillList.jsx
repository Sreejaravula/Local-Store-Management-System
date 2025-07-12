import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Mail, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import BillModal from './BillModal';

function BillList() {
  const [bills, setBills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bills');
      setBills(response.data);
    } catch (error) {
      toast.error('Error fetching bills');
    }
  };

  const handleDownloadPDF = async (billId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bills/${billId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Error downloading PDF');
    }
  };

  const handleSendReminder = async (billId) => {
    try {
      await axios.post(`http://localhost:5000/api/notifications/send-reminder/${billId}`);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Error sending reminder');
    }
  };

  const updatePayment = async (billId, paidAmount) => {
    try {
      await axios.patch(`http://localhost:5000/api/bills/${billId}`, { paidAmount });
      fetchBills();
      toast.success('Payment updated successfully');
    } catch (error) {
      toast.error('Error updating payment');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bills</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Create Bill
        </button>
      </div>

      <div className="grid gap-6">
        {bills.map(bill => (
          <div key={bill._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Bill #{bill._id.slice(-6)}</h3>
                <div className="space-y-2">
                  {bill.customers.map((customer, index) => (
                    <div key={index} className="text-gray-600">
                      <p>Customer: {customer.name}</p>
                      <p>Email: {customer.email}</p>
                      <p>Mobile: {customer.mobileNumbers.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadPDF(bill._id)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Download PDF"
                >
                  <Download size={20} />
                </button>
                {(bill.status === 'unpaid' || bill.status === 'partially-paid') && (
                  <button
                    onClick={() => handleSendReminder(bill._id)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title="Send Reminder"
                  >
                    <Mail size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="font-semibold">Items:</h4>
              {bill.items.map((item, index) => (
                <div key={index} className="flex justify-between text-gray-600">
                  <span>{item.item.name} × {item.quantity}</span>
                  <span>₹{(item.item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Total Amount:</span>
                <span>₹{bill.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Paid Amount:</span>
                <span>₹{bill.paidAmount.toFixed(2)}</span>
              </div>
              {bill.status === 'partially-paid' && (
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Pending Amount:</span>
                  <span>₹{(bill.totalAmount - bill.paidAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-semibold">Status:</span>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                  bill.status === 'partially-paid' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {bill.status}
                </span>
              </div>
            </div>

            {bill.status !== 'paid' && (
              <div className="mt-4">
                <input
                  type="number"
                  placeholder="Enter payment amount"
                  className="border rounded px-3 py-2 mr-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updatePayment(bill._id, parseFloat(e.target.value));
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    updatePayment(bill._id, parseFloat(input.value));
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Update Payment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <BillModal
          onClose={() => setIsModalOpen(false)}
          onSave={fetchBills}
        />
      )}
    </div>
  );
}

export default BillList