import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, Plus, Minus, IndianRupee } from "lucide-react";
import { toast } from "react-toastify";

function BillModal({ onClose, onSave }) {
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([{ itemId: "", quantity: 1 }]);
  const [customers, setCustomers] = useState([{ name: "", email: "", mobileNumbers: [""] }]);
  const [noAddCustomers, setNoAddCustomers] = useState(false);
  const [addMobileNumber, setAddMobileNumber] = useState(false);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  const effectRan = useRef(false);

  // Fetch items & tags on mount
  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;
    fetchItems();
    fetchTags();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/items");
      setItems(data);
      setFilteredItems(data);
    } catch {
      toast.error("Error fetching items");
    }
  };

  const fetchTags = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/tags", {
        params: { pinned: true },
      });
      setTags(data);
    } catch {
      toast.error("Error fetching tags");
    }
  };

  // Customer Handlers
  const handleAddCustomer = () => {
    setCustomers([...customers, { name: "", email: "", mobileNumbers: [""] }]);
  };

  const handleRemoveCustomer = (index) => {
    setCustomers(customers.filter((_, i) => i !== index));
  };

  const handleAddMobileNumber = (customerIndex) => {
    const newCustomers = [...customers];
    newCustomers[customerIndex].mobileNumbers.push("");
    setCustomers(newCustomers);
  };

  const handleRemoveMobileNumber = (customerIndex, numberIndex) => {
    const newCustomers = [...customers];
    newCustomers[customerIndex].mobileNumbers.splice(numberIndex, 1);
    setCustomers(newCustomers);
  };

  // Item Handlers
  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { itemId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleTagFilter = (tagId) => {
    if (tagId === "0") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.tags.some((tag) => tag._id === tagId)));
    }
  };

  const calculateTotal = () =>
    selectedItems.reduce((total, selected) => {
      const item = items.find((i) => i._id === selected.itemId);
      return total + (item ? item.price * selected.quantity : 0);
    }, 0);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customers.every((c) => c.name && c.mobileNumbers[0])) {
      toast.error("Please fill in all required customer fields");
      return;
    }

    if (!selectedItems.every((i) => i.itemId)) {
      toast.error("Please select all items");
      return;
    }

    try {
      const billData = {
        customers,
        items: selectedItems.map(({ itemId, quantity }) => ({
          item: itemId,
          quantity,
        })),
        totalAmount: calculateTotal(),
        paidAmount: 0,
        status: "unpaid",
      };

      await axios.post("http://localhost:5000/api/bills", billData);
      onSave();
      onClose();
      toast.success("Bill created successfully");
    } catch {
      toast.error("Error creating bill");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Bill</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customers */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Customers</h3>
              {customers.length < 5 ? (
                <button
                  type="button"
                  onClick={handleAddCustomer}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Plus size={20} />
                </button>
              ) : (
                <div className="relative flex flex-col items-start">
                  <button
                    type="button"
                    onMouseEnter={() => setNoAddCustomers(true)}
                    onMouseLeave={() => setNoAddCustomers(false)}
                    className="text-gray-500 cursor-not-allowed"
                  >
                    <Plus size={20} />
                  </button>
                  {noAddCustomers && (
                    <div className="absolute -top-1 bg-blue-800 text-white text-sm px-3 py-1 rounded-md shadow-lg whitespace-nowrap transform -translate-x-full">
                      You can only add up to 5 customers
                    </div>
                  )}
                </div>
              )}
            </div>

            {customers.map((customer, cIndex) => (
              <div key={cIndex} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Customer {cIndex + 1}</h4>
                  {cIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomer(cIndex)}
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
                      newCustomers[cIndex].name = e.target.value;
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
                      newCustomers[cIndex].email = e.target.value;
                      setCustomers(newCustomers);
                    }}
                    className="border rounded px-3 py-2"
                  />

                  {customer.mobileNumbers.map((number, nIndex) => (
                    <div key={nIndex} className="flex gap-2">
                      <input
                        type="tel"
                        placeholder={`Mobile Number ${nIndex + 1} *`}
                        value={number}
                        onChange={(e) => {
                          const newCustomers = [...customers];
                          newCustomers[cIndex].mobileNumbers[nIndex] = e.target.value;
                          setCustomers(newCustomers);
                        }}
                        className="flex-1 border rounded px-3 py-2"
                        required
                      />

                      {nIndex === 0 ? (
                        customer.mobileNumbers.length < 3 ? (
                          <button
                            type="button"
                            onClick={() => handleAddMobileNumber(cIndex)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Plus size={20} />
                          </button>
                        ) : (
                          <div className="relative flex flex-col items-start">
                            <button
                              type="button"
                              onMouseEnter={() => {
                                setAddMobileNumber(true);
                                setCurrentCustomerIndex(cIndex);
                              }}
                              onMouseLeave={() => {
                                setAddMobileNumber(false);
                                setCurrentCustomerIndex(0);
                              }}
                              className="text-gray-500 cursor-not-allowed"
                            >
                              <Plus size={20} />
                            </button>
                            {addMobileNumber && currentCustomerIndex === cIndex && (
                              <div className="absolute -top-1 bg-blue-800 text-white text-sm px-3 py-1 rounded-md shadow-lg whitespace-nowrap transform -translate-x-full">
                                You can only add up to 3 mobile numbers
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveMobileNumber(cIndex, nIndex)}
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

          {/* Items */}
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
                    if (
                      selectedItems.some(
                        (item, ind) => item.itemId === e.target.value && ind !== index
                      )
                    ) {
                      toast.info("Item already selected");
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
                  {filteredItems.map((item) => (
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

                <select
                  className="border rounded px-3 py-2"
                  onChange={(e) => handleTagFilter(e.target.value)}
                >
                  <option value="0">Select Tag</option>
                  {tags.map((tag) => (
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

          {/* Total */}
          <div className="text-right mb-6">
            <p className="text-xl font-semibold flex justify-end items-center gap-1">
              <span>Total:</span>
              <IndianRupee size={20} />
              <span>{calculateTotal().toFixed(2)}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Create Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BillModal;
