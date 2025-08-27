import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, PinOff } from 'lucide-react';
import ItemModal from './ItemModal';
import { toast } from 'react-toastify';

function ItemList() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterTags, setFilterTags] = useState(new Set());

  useEffect(() => {
    fetchItems();
    fetchTags();
  }, []);

  /** ---------------------------
   * API HANDLERS
   * --------------------------- */
  const fetchTags = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/tags', {
        params: { pinned: true },
      });
      setSelectedTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/items');
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item');
    }
  };

  const unPinTag = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/tags/${id}`, { pinned: false });
      toast.success('Tag unpinned successfully');
      fetchTags();
    } catch (error) {
      console.error('Error unpinning tag:', error);
      toast.error('Error unpinning tag');
    }
  };

  /** ---------------------------
   * FILTER & SORT
   * --------------------------- */
  const toggleTag = (id) => {
    setFilterTags((prev) => {
      const newTags = new Set(prev);
      newTags.has(id) ? newTags.delete(id) : newTags.add(id);
      return newTags;
    });
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesTags =
          filterTags.size === 0 || item.tags.some((tag) => filterTags.has(tag._id));

        return matchesSearch && matchesTags;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        }
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
  }, [items, searchTerm, filterTags, sortBy, sortOrder]);

  /** ---------------------------
   * RENDER
   * --------------------------- */
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="border rounded-lg px-4 py-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>

        <select
          className="border rounded-lg px-4 py-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Pinned Tags */}
      <div className="flex gap-2 mb-6">
        {selectedTags.map((tag) => (
          <div key={tag._id} className="flex gap-2">
            <button
              onClick={() => toggleTag(tag._id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                filterTags.has(tag._id) ? 'bg-blue-500 text-white' : 'bg-white text-black border'
              }`}
            >
              {tag.name}
            </button>
            <button
              onClick={() => unPinTag(tag._id)}
              className="text-red-500 flex items-center"
            >
              <PinOff size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={item.photo} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2">₹{item.price.toFixed(2)}</p>
              <div className="flex flex-wrap gap-2 items-center">
                {item.tags.map((tag) => (
                  <span key={tag._id} className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                    {tag.name}
                  </span>
                ))}
                <button
                  onClick={() => deleteItem(item._id)}
                  className="ml-auto bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ItemModal onClose={() => setIsModalOpen(false)} onSave={fetchItems} />
      )}
    </div>
  );
}

export default ItemList;
