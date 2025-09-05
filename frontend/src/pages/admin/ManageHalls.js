import React, { useEffect, useState } from 'react';
import { Plus, X, Edit, Trash2, MapPin, Users, Crown, Settings, Eye, EyeOff, Save, Monitor } from 'lucide-react';
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
    },
    status: 'active'
  });

  const availableFeatures = [
    { id: 'air_conditioning', label: 'Air Conditioning' },
    { id: 'dolby_sound', label: 'Dolby Sound' },
    { id: 'imax', label: 'IMAX' },
    { id: '3d_capable', label: '3D Capable' },
    { id: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
    { id: 'reclining_seats', label: 'Reclining Seats' },
    { id: 'food_service', label: 'Food Service' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
    { value: 'inactive', label: 'Inactive', color: 'red' }
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
      },
      status: 'active'
    });
    setEditingHall(null);
    setShowForm(false);
    setError('');
    setSuccess('');
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
        i === index ? { ...block, [field]: value } : block
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
        i === index ? { ...box, [field]: value } : box
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
        },
        seatBlocks: form.seatBlocks.map(block => ({
          ...block,
          rows: parseInt(block.rows),
          seatsPerRow: parseInt(block.seatsPerRow)
        })),
        boxSeats: form.boxSeats.map(box => ({
          ...box,
          capacity: parseInt(box.capacity)
        }))
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
      pricing: hall.pricing || { regular: 10, box: 25 },
      status: hall.status || 'active'
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
      total + (parseInt(block.rows) * parseInt(block.seatsPerRow)), 0
    );
    const boxSeatsTotal = form.boxSeats.reduce((total, box) => 
      total + parseInt(box.capacity), 0
    );
    return regularSeats + boxSeatsTotal;
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Halls</h2>
            <p className="text-gray-600 mt-1">Create and manage cinema halls with custom layouts</p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancel' : 'Add New Hall'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <Save className="w-5 h-5" />
            {success}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingHall ? 'Edit Hall' : 'Add New Hall'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hall Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Hall A, Premium Theater 1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g., Ground Floor, East Wing"
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dimensions */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Hall Dimensions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (meters) *
                    </label>
                    <input
                      type="number"
                      name="dimensions.width"
                      value={form.dimensions.width}
                      onChange={handleChange}
                      placeholder="20"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (meters) *
                    </label>
                    <input
                      type="number"
                      name="dimensions.height"
                      value={form.dimensions.height}
                      onChange={handleChange}
                      placeholder="15"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Screen Position
                    </label>
                    <select
                      name="dimensions.screenPosition"
                      value={form.dimensions.screenPosition}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="front">Front</option>
                      <option value="back">Back</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seat Blocks */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Seat Blocks ({form.seatBlocks.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addSeatBlock}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Block
                  </button>
                </div>

                {form.seatBlocks.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No seat blocks added yet</p>
                  </div>
                )}

                {form.seatBlocks.map((block, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">Block {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeSeatBlock(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Block Name
                        </label>
                        <input
                          type="text"
                          value={block.name}
                          onChange={(e) => updateSeatBlock(index, 'name', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rows
                        </label>
                        <input
                          type="number"
                          value={block.rows}
                          onChange={(e) => updateSeatBlock(index, 'rows', e.target.value)}
                          min="1"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seats per Row
                        </label>
                        <input
                          type="number"
                          value={block.seatsPerRow}
                          onChange={(e) => updateSeatBlock(index, 'seatsPerRow', e.target.value)}
                          min="1"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Box Seats */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Premium Box Seats ({form.boxSeats.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addBoxSeat}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Box
                  </button>
                </div>

                {form.boxSeats.map((box, index) => (
                  <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-purple-900">Box {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeBoxSeat(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-2">
                          Box Name
                        </label>
                        <input
                          type="text"
                          value={box.name}
                          onChange={(e) => updateBoxSeat(index, 'name', e.target.value)}
                          className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-2">
                          Capacity
                        </label>
                        <input
                          type="number"
                          value={box.capacity}
                          onChange={(e) => updateBoxSeat(index, 'capacity', e.target.value)}
                          min="1"
                          max="8"
                          className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Pricing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Regular Seat Price ($)
                    </label>
                    <input
                      type="number"
                      name="pricing.regular"
                      value={form.pricing.regular}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Box Seat Price ($)
                    </label>
                    <input
                      type="number"
                      name="pricing.box"
                      value={form.pricing.box}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Hall Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableFeatures.map(feature => (
                    <label key={feature.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.features.includes(feature.id)}
                        onChange={() => handleFeatureChange(feature.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {(form.seatBlocks.length > 0 || form.boxSeats.length > 0) && (
                <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Hall Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Total Seats:</span>
                      <span className="font-medium text-blue-900 ml-1">{getTotalSeats()}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Regular Seats:</span>
                      <span className="font-medium text-blue-900 ml-1">
                        {form.seatBlocks.reduce((total, block) => 
                          total + (parseInt(block.rows) || 0) * (parseInt(block.seatsPerRow) || 0), 0
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Box Seats:</span>
                      <span className="font-medium text-blue-900 ml-1">
                        {form.boxSeats.reduce((total, box) => total + (parseInt(box.capacity) || 0), 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Dimensions:</span>
                      <span className="font-medium text-blue-900 ml-1">
                        {form.dimensions.width}m × {form.dimensions.height}m
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingHall ? 'Update Hall' : 'Create Hall'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Halls List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {halls.map(hall => (
            <div key={hall._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{hall.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {hall.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      getStatusColor(hall.status) === 'green' ? 'bg-green-100 text-green-800' :
                      getStatusColor(hall.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {statusOptions.find(opt => opt.value === hall.status)?.label || hall.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-blue-900">{hall.totalSeats}</div>
                    <div className="text-xs text-blue-600">Total Seats</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Crown className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-purple-900">
                      {hall.boxSeats ? hall.boxSeats.length : 0}
                    </div>
                    <div className="text-xs text-purple-600">Box Seats</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Dimensions:</span>
                    <span>{hall.dimensions?.width}m × {hall.dimensions?.height}m</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Regular Price:</span>
                    <span>${hall.pricing?.regular}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Box Price:</span>
                    <span>${hall.pricing?.box}</span>
                  </div>
                </div>

                {hall.features && hall.features.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {hall.features.slice(0, 3).map(feature => (
                        <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {availableFeatures.find(f => f.id === feature)?.label || feature}
                        </span>
                      ))}
                      {hall.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{hall.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(hall)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hall._id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {halls.length === 0 && !showForm && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No halls found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first cinema hall</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Hall
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageHalls;