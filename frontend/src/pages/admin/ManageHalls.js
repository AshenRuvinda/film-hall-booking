import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

function ManageHalls() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingHall, setEditingHall] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    location: '',
    seatBlocks: [],
    boxSeats: [],
    dimensions: {
      width: '',
      height: '',
      screenPosition: 'front'
    },
    features: [],
    pricing: {
      regular: 10,
      box: 25
    }
  });

  const availableFeatures = [
    'air_conditioning',
    'dolby_sound',
    'imax',
    '3d_capable',
    'wheelchair_accessible',
    'reclining_seats',
    'food_service'
  ];

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const res = await api.get('/admin/halls');
      setHalls(res.data);
    } catch (error) {
      setError('Failed to fetch halls');
      console.error('Fetch halls error:', error);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      location: '',
      seatBlocks: [],
      boxSeats: [],
      dimensions: {
        width: '',
        height: '',
        screenPosition: 'front'
      },
      features: [],
      pricing: {
        regular: 10,
        box: 25
      }
    });
    setEditingHall(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFeatureChange = (feature) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const addSeatBlock = () => {
    setForm(prev => ({
      ...prev,
      seatBlocks: [
        ...prev.seatBlocks,
        {
          name: `Block ${prev.seatBlocks.length + 1}`,
          rows: 5,
          seatsPerRow: 10,
          position: { x: prev.seatBlocks.length * 100, y: 100 }
        }
      ]
    }));
  };

  const updateSeatBlock = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      seatBlocks: prev.seatBlocks.map((block, i) => 
        i === index ? { ...block, [field]: parseInt(value) || value } : block
      )
    }));
  };

  const removeSeatBlock = (index) => {
    setForm(prev => ({
      ...prev,
      seatBlocks: prev.seatBlocks.filter((_, i) => i !== index)
    }));
  };

  const addBoxSeat = () => {
    setForm(prev => ({
      ...prev,
      boxSeats: [
        ...prev.boxSeats,
        {
          name: `Box ${prev.boxSeats.length + 1}`,
          capacity: 4,
          position: { x: prev.boxSeats.length * 150 + 100, y: 50 }
        }
      ]
    }));
  };

  const updateBoxSeat = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      boxSeats: prev.boxSeats.map((box, i) => 
        i === index ? { ...box, [field]: parseInt(value) || value } : box
      )
    }));
  };

  const removeBoxSeat = (index) => {
    setForm(prev => ({
      ...prev,
      boxSeats: prev.boxSeats.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.location || form.seatBlocks.length === 0) {
      setError('Name, location, and at least one seat block are required');
      return;
    }

    if (!form.dimensions.width || !form.dimensions.height) {
      setError('Hall dimensions are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        ...form,
        dimensions: {
          ...form.dimensions,
          width: parseFloat(form.dimensions.width),
          height: parseFloat(form.dimensions.height)
        }
      };

      if (editingHall) {
        await api.put(`/admin/halls/${editingHall._id}`, data);
        setSuccess('Hall updated successfully!');
      } else {
        await api.post('/admin/halls', data);
        setSuccess('Hall created successfully!');
      }
      
      resetForm();
      fetchHalls();
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to save hall');
      console.error('Save hall error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hall) => {
    setEditingHall(hall);
    setForm({
      name: hall.name,
      location: hall.location,
      seatBlocks: hall.seatBlocks || [],
      boxSeats: hall.boxSeats || [],
      dimensions: hall.dimensions || { width: '', height: '', screenPosition: 'front' },
      features: hall.features || [],
      pricing: hall.pricing || { regular: 10, box: 25 }
    });
    setShowForm(true);
  };

  const handleDelete = async (hallId) => {
    if (!window.confirm('Are you sure you want to delete this hall?')) {
      return;
    }

    try {
      await api.delete(`/admin/halls/${hallId}`);
      setSuccess('Hall deleted successfully!');
      fetchHalls();
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to delete hall');
    }
  };

  const getTotalSeats = () => {
    const regularSeats = form.seatBlocks.reduce((total, block) => 
      total + (block.rows * block.seatsPerRow), 0
    );
    const boxSeatsTotal = form.boxSeats.reduce((total, box) => 
      total + box.capacity, 0
    );
    return regularSeats + boxSeatsTotal;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Halls</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <span>{showForm ? '×' : '+'}</span>
          {showForm ? 'Cancel' : 'Add New Hall'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6">
            {editingHall ? 'Edit Hall' : 'Add New Hall'}
          </h3>
          
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hall Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Hall A, Premium Theater 1"
                className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Ground Floor, Second Floor - East Wing"
                className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required