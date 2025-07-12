import React, { useState } from "react";
import { X, Plus, PinOff, Pin } from "lucide-react";
import { toast } from "react-toastify";

function TagModal({ onClose, onSave }) {
    const [tagName, setTagName] = useState("");
    const [tagColor, setTagColor] = useState("#000000");
    const [tagPinned, setTagPinned] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tagName.trim()) {
            toast.error("Tag name is required");
            return;
        }
        onSave({ name: tagName, color: tagColor, pinned: tagPinned });
        onClose();
        toast.success("Tag added successfully");
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Add Tag</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <h1>This is Tag Modal</h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="mb-4">
                        <label className="block font-medium mb-1">Tag Name *</label>
                        <input
                            type="text"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Enter tag name"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium mb-1">Tag Color</label>
                        <input
                            type="color"
                            value={tagColor}
                            onChange={(e) => setTagColor(e.target.value)}
                            className="w-10 h-10 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium mb-1">Pin Tag</label>
                        {tagPinned ? <PinOff className="size-10" fill="black" onClick={() => setTagPinned(false)} />
                            : <Pin className="size-10" fill="black" onClick={() => setTagPinned(true)} />
                        }
                    </div>

                    

                    {/* Buttons Section */}
                    <div className="flex justify-end gap-4 mt-4">
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
                            Submit
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default TagModal;
