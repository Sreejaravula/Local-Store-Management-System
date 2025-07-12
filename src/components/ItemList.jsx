import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Trash2, PinOff, Pin } from 'lucide-react';
import ItemModal from './ItemModal';
import { toast } from 'react-toastify';
import { set } from 'mongoose';

function ItemList() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterTags, setFilterTags] = useState(() => new Set());
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tags', {
        params: {
          pinned: true,
        }
      });
      setSelectedTags(response.data);
    }
    catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const unPinTag = async (id) => {
    try {
      await axios.patch("http://localhost:5000/api/tags/" + id, { pinned: false });
      fetchTags();
      toast.success("Tag unpinned successfully");
    }
    catch (error) {
      console.error("Error unpinning tag", error);
      toast.error("Error unpinning tag");
    }
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
      setFilteredItems(response.data
        .filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (searchTerm.length === 0 ||
            item.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())))
        )
        .sort((a, b) => {
          if (sortBy === 'date') {
            return sortOrder === 'asc'
              ? new Date(a.createdAt) - new Date(b.createdAt)
              : new Date(b.createdAt) - new Date(a.createdAt);
          } else {
            return sortOrder === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
        })
      );
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete('http://localhost:5000/api/items/' + id);
      fetchItems();
      toast.success("Item deleted successfully");
    }
    catch (error) {
      console.error("Error deleting item", error);
      toast.error("Error deleting item");
    }
  }

  const selectTag = async (id) => {
    if (filterTags.has(id)) {
      filterTags.delete(id);
    }
    else {
      filterTags.add(id);
    }
    if (filterTags.size === 0) { 
      console.log("No tags selected", items);
      setFilteredItems(items)
      return
    }
    setFilterTags(new Set(filterTags));
    setFilteredItems(items
      .filter(item =>
        item.tags.some(tag => filterTags.has(tag._id))
    ) )
  }

  const allItems = filteredItems
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (searchTerm.length === 0 ||
        item.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });
  
  return (
    <div>
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

      {/* These are the pinned tags */}
      <div className='flex gap-2 mb-6'>
        {selectedTags.map(tag => (
          <div className="flex gap-2" key={tag._id + "pinned"}>
            <button
              className={`text-black bg-${filterTags.has(tag._id) ? 'blue-500' : 'white'} px-4 py-2 rounded-lg flex items-center gap-2`} onClick={() => selectTag(tag._id)}
            >
              {tag.name}
              <PinOff size={20} onClick={() => unPinTag(tag._id)} />
            </button>
            
          </div>

        ))}
      </div>

      {/* These are filtered items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allItems.map(item => (
          <div key={item._id + "item"} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={item.photo} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2">₹{item.price.toFixed(2)}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span key={tag._id + "inside item"} className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                    {tag.name}
                  </span>
                ))}
                {/* button to delete this item */}
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Trash2 size={20} onClick={() => deleteItem(item._id)} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ItemModal
          onClose={() => setIsModalOpen(false)}
          onSave={fetchItems}
        />
      )}
    </div>
  );
}

export default ItemList;