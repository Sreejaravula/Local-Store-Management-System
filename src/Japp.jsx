import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ItemList from './components/ItemList';
import BillList from './components/BillList';
import TagManagement from './components/TagManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ItemList />} />
            <Route path="/bills" element={<BillList />} />
            <Route path="/tags" element={<TagManagement />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;