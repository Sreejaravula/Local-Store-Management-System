import React, { useState, useEffect, useRef, useReducer } from 'react';
import axios from 'axios';
import { X, Plus, Minus, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { set } from 'mongoose';


const ItemCard = (item, index, deleteItem, totalItems, totalTags, selectedItemsIndices, setSelectedItemsIndices, selectedItems, setSelectedItems) => {
  const [items, setItems] = useState(totalItems);
  const tagsReducer = (state, action) => {
    const newTags = new Set(state);
    if (action.type === 'add') {
      newTags.add(action.tag);
    }
    if (action.type === 'remove') {
      newTags.delete(action.tag);
    }
    return newTags ? newTags : new Set(totalTags);
  }

  const [tags, dispatch] = useReducer(tagsReducer, new Set(totalTags));
  


  return (
    <div className="flex gap-4 mb-4">
      <select
        value={item.itemId}
        onChange={(e) => {
          if (selectedItemsIndices.some((ind) => ind === index)) {
            toast.info('Item already selected');
            return;
          }
          const newItems = [...selectedItems];
          newItems[index].itemId = e.target.value;
          setSelectedItems(newItems);
        }}
        className="flex-1 border rounded px-3 py-2"
        required
      >
        <option value="">Select an item</option>
        {totalItems.map(item => (
          <option key={item._id} value={item._id}>
            {item.name} - ₹{item.price}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => {
          const newItems = [...selectedItems];
          newItems[index].quantity = parseInt(e.target.value) || 1;
          setSelectedItems(newItems);
        }}
        className="w-24 border rounded px-3 py-2"
      />

      <select className="border rounded px-3 py-2" onChange={(e) => {

        setItems(items.filter(item => item.tags.some(tag => tag._id === e.target.value)))
      }}>
        <option value="0">Select Tag</option>
        {totalTags.map(tag => (
          <option key={tag._id} value={tag._id}>
            {tag.name}
          </option>
        ))}
      </select>

      {index > 0 && (
        <button
          type="button"
          onClick={() => handleRemoveItem(index)}
          className="text-red-500 hover:text-red-700"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
function BillModal({ onClose, onSave }) {
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedItems, setSelectedItems] = useState([{ itemId: '', quantity: 1 }]);
  const [customers, setCustomers] = useState([{ name: '', email: '', mobileNumbers: [''] }]);
  const [noAddCustomers, setNoAddCustomers] = useState(false);
  const [addMobileNumber, setAddMobileNumber] = useState(false);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  const [selectedItemsIndices, setSelectedItemsIndices] = useState([])
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) {
      return;
    }
    effectRan.current = true;
    fetchItems();
    fetchTags();
  }, []);

  console.log("BillModal");

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
      console.log(response.data)
    } catch (error) {
      toast.error('Error fetching items');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tags", {
        params: {
          pinned: true
        }
      })
      setTags(response.data)
    }
    catch (error) {
      toast.error("Error fetching tags")
    }
  }

  const handleAddCustomer = () => {
    setCustomers([...customers, { name: '', email: '', mobileNumbers: [''] }]);
  };

  const handleRemoveCustomer = (index) => {
    setCustomers(customers.filter((_, i) => i !== index));
  };

  const handleAddMobileNumber = (customerIndex) => {
    const newCustomers = [...customers];
    newCustomers[customerIndex].mobileNumbers.push('');
    setCustomers(newCustomers);
  };

  const handleRemoveMobileNumber = (customerIndex, numberIndex) => {
    const newCustomers = [...customers];
    newCustomers[customerIndex].mobileNumbers.splice(numberIndex, 1);
    setCustomers(newCustomers);
  };

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { itemId: '', quantity: 1 }]);
    setSelectedItemsIndices([...selectedItemsIndices, -1])
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, selected) => {
      const item = items.find(i => i._id === selected.itemId);
      return total + (item ? item.price * selected.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!customers.every(c => c.name && c.mobileNumbers[0])) {
      toast.error('Please fill in all required customer fields');
      return;
    }

    if (!selectedItems.every(i => i.itemId)) {
      toast.error('Please select all items');
      return;
    }

    try {
      const billData = {
        customers,
        items: selectedItems.map(item => ({
          item: item.itemId,
          quantity: item.quantity
        })),
        totalAmount: calculateTotal(),
        paidAmount: 0,
        status: 'unpaid'
      };

      await axios.post('http://localhost:5000/api/bills', billData);
      onSave();
      onClose();
      toast.success('Bill created successfully');
    } catch (error) {
      toast.error('Error creating bill');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Bill</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customers Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Customers</h3>
              {customers.length < 5 ?
                (<button
                  type="button"
                  onClick={handleAddCustomer}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Plus size={20} />
                </button>) :
                (<div className="relative flex flex-col items-start">
                  <button
                    type="button"
                    onMouseEnter={() => setNoAddCustomers(true)}
                    onMouseLeave={() => setNoAddCustomers(false)}
                    className="text-gray-500 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Plus size={20} />
                  </button>
                  {noAddCustomers && (
                    <div className="absolute -top-1 bg-blue-800 text-white text-sm px-3 py-1 rounded-md shadow-lg whitespace-nowrap transform -translate-x-full">
                      You can only add up to 5 customers
                    </div>
                  )}
                </div>)}
            </div>

            {customers.map((customer, customerIndex) => (
              <div key={customerIndex} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Customer {customerIndex + 1}</h4>
                  {customerIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomer(customerIndex)}
                      className="text-red-200 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={customer.name}
                    onChange={(e) => {
                      const newCustomers = [...customers];
                      newCustomers[customerIndex].name = e.target.value;
                      setCustomers(newCustomers);
                    }}
                    className="border rounded px-3 py-2"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={customer.email}
                    onChange={(e) => {
                      const newCustomers = [...customers];
                      newCustomers[customerIndex].email = e.target.value;
                      setCustomers(newCustomers);
                    }}
                    className="border rounded px-3 py-2"
                  />

                  {customer.mobileNumbers.map((number, numberIndex) => (
                    <div key={numberIndex} className="flex gap-2">
                      <input
                        type="tel"
                        placeholder={`Mobile Number ${numberIndex + 1} *`}
                        value={number}
                        onChange={(e) => {
                          const newCustomers = [...customers];
                          newCustomers[customerIndex].mobileNumbers[numberIndex] = e.target.value;
                          setCustomers(newCustomers);
                        }}
                        className="flex-1 border rounded px-3 py-2"
                        required
                      />
                      {numberIndex === 0 ?

                        customer.mobileNumbers.length < 3 ? (
                          <button type="button" onClick={() => handleAddMobileNumber(customerIndex)} className="text-blue-500 hover:text-blue-700" >
                            <Plus size={20} />
                          </button>) :
                          (
                            <div className="relative flex flex-col items-start">
                              <button
                                type="button"
                                onMouseEnter={() => {
                                  setAddMobileNumber(true)
                                  setCurrentCustomerIndex(customerIndex)
                                }}
                                onMouseLeave={() => {
                                  setAddMobileNumber(false)
                                  setCurrentCustomerIndex(0)
                                }}
                                className="text-gray-500 cursor-not-allowed flex items-center justify-center space-x-2"
                              >
                                <Plus size={20} />
                              </button>
                              {addMobileNumber && currentCustomerIndex === customerIndex && (
                                <div className="absolute -top-1 bg-blue-800 text-white text-sm px-3 py-1 rounded-md shadow-lg whitespace-nowrap transform -translate-x-full">
                                  You can only add up to 3 mobile numbers
                                </div>
                              )}
                            </div>
                          )
                        : (
                          <button
                            type="button"
                            onClick={() => handleRemoveMobileNumber(customerIndex, numberIndex)}
                            className="text-red-200 hover:text-red-700"
                          >
                            <Minus size={20} />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-500 hover:text-blue-700"
              >
                <Plus size={20} />
              </button>
              <div className="flex items-center gap-4">
                <h2>Tags</h2>
              </div>
            </div>

            {selectedItems.map((selected, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <select
                  value={selected.itemId}
                  onChange={(e) => {
                    if (selectedItems.some((item, ind) => item.itemId === e.target.value && ind !== index)) {
                      toast.info('Item already selected');
                      return;
                    }
                    const newItems = [...selectedItems];
                    newItems[index].itemId = e.target.value;
                    setSelectedItems(newItems);
                  }}
                  className="flex-1 border rounded px-3 py-2"
                  required
                >
                  <option value="">Select an item</option>
                  {items.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name} - ₹{item.price}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={selected.quantity}
                  onChange={(e) => {
                    const newItems = [...selectedItems];
                    newItems[index].quantity = parseInt(e.target.value) || 1;
                    setSelectedItems(newItems);
                  }}
                  className="w-24 border rounded px-3 py-2"
                />

                <select className="border rounded px-3 py-2" onChange={(e) => {
                  // console.log("selected tag", e.target.value, items)
                  setItems(items.filter(item => item.tags.some(tag => tag._id === e.target.value)))
                }}>
                  <option value="0">Select Tag</option>
                  {tags.map(tag => (
                    <option key={tag._id} value={tag._id}>
                      {tag.name}
                    </option>
                  ))}
                </select>

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="text-right mb-6">
            <p className="text-xl font-semibold flex justify-end items-center gap-1">
              <span>Total:</span>
              <IndianRupee size={20} />
              <span>{calculateTotal().toFixed(2)}</span>
            </p>
          </div>


          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Create Bill
            </button>
          </div>
        </form>
      </div >
    </div >
  );
}

export default BillModal