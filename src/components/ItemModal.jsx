import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

function ItemModal({ item, onClose, onSave }) {
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price || '');
  const [photo, setPhoto] = useState(item?.photo || '');
  const [selectedTags, setSelectedTags] = useState(item?.tags?.map(t => t._id) || []);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tags');
      setAvailableTags(response.data);
    } catch (error) {
      toast.error('Error fetching tags');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const itemData = {
        name,
        price: parseFloat(price),
        photo,
        tags: selectedTags
      };

      if (item) {
        await axios.patch(`http://localhost:5000/api/items/${item._id}`, itemData);
      } else {
        await axios.post('http://localhost:5000/api/items', itemData);
      }

      onSave();
      onClose();
      toast.success(`Item ${item ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(`Error ${item ? 'updating' : 'creating'} item`);
    }
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{item ? 'Edit' : 'Add'} Item</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Price</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Photo URL</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableTags.map(tag => (
                <button
                  key={tag._id}
                  type="button"
                  className={`px-3 py-1 border rounded ${selectedTags.includes(tag._id) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  onClick={() => handleTagToggle(tag._id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemModal;
