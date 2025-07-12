import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Pin, PinOff } from 'lucide-react';
import { toast } from 'react-toastify';
import TagModal from './TagModal';

function TagManagement() {
  const [tags, setTags] = useState([]);
  const [pinnedTags, setPinnedTags] = useState([]);
  const [unPinnedTags, setUnPinnedTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  // const [newTagColor, setNewTagColor] = useState('#000000');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      let response = await axios.get('http://localhost:5000/api/tags');
      response = await response.data
      setTags(response);
      setPinnedTags(response.filter(tag => tag.pinned));
      setUnPinnedTags(response.filter(tag => !tag.pinned));
    } catch (error) {
      toast.error('Error fetching tags' + error.message);
    }
  };

  const togglePin = async (tagId, newTagPin) => {
    try {
      await axios.patch('http://localhost:5000/api/tags/' + tagId, { pinned: newTagPin });
      if (newTagPin) {
        const toggledTag = unPinnedTags.find(tag => tag._id === tagId);
        setPinnedTags([...pinnedTags, toggledTag]);
        setUnPinnedTags(unPinnedTags.filter(tag => tag._id !== tagId));
      }
      else {
        const toggledTag = pinnedTags.find(tag => tag._id === tagId);
        setUnPinnedTags([...unPinnedTags, toggledTag]);
        setPinnedTags(pinnedTags.filter(tag => tag._id !== tagId));
      }
      toast.success('Toggled pinned successfully');
    }
    catch (error) {
      console.log("Error toggling Tag", error);
      toast.error('Error toggling tag pin');
    }
  }

  const handleAddTag = async ({name, color}) => {
    // e.preventDefault();
    // if (!newTagName.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/tags', { name: name, color: color });
      // setNewTagName('');
      fetchTags();
      toast.success('Tag added successfully');
    } catch (error) {
      toast.error('Error adding tag');
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tags/${tagId}`);
      fetchTags();
      toast.success('Tag deleted successfully');
    } catch (error) {
      toast.error('Error deleting tag');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tag Management</h1>

      <form onSubmit={() => { setIsModalOpen(true) }} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter new tag name"
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => { setIsModalOpen(true) }}
            type="button"
          >
            <Plus size={20} />
            Add Tag
          </button>
        </div>
      </form>
      <h2>Pinned Tags</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pinnedTags && pinnedTags.map(tag => (
          <div
            key={tag._id}
            className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
          >
            <span className="font-medium">{tag.name}</span>
            {/* <div className="w-10 h-10 rounded border" style={{ backgroundColor: tag.color }}></div> */}
            <PinOff size={20} fill="black" className="cursor-pointer" onClick={() => togglePin(tag._id, false) } />

            <button
              onClick={() => handleDeleteTag(tag._id)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      <h2>Unpinned Tags</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {unPinnedTags && unPinnedTags.map(tag => (
          <div
            key={tag._id}
            className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
          >
            <span className="font-medium">{tag.name}</span>
            {/* <div className="w-10 h-10 rounded border" style={{ backgroundColor: tag.color }}></div> */}
              <Pin size={20} fill="black" className="cursor-pointer" onClick={() => togglePin(tag._id, true) } />

            <button
              onClick={() => handleDeleteTag(tag._id)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>


      {isModalOpen && (<TagModal onClose={() => setIsModalOpen(false)} onSave={handleAddTag} />)}
    </div>
  );
}

export default TagManagement