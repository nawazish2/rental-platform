import { useState } from 'react';

export default function FilterBar({ onFilter }) {
  const [filters, setFilters] = useState({ location: '', budgetMin: '', budgetMax: '', moveInDate: '', type: '' });

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const reset = { location: '', budgetMin: '', budgetMax: '', moveInDate: '', type: '' };
    setFilters(reset);
    onFilter(reset);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="Location or city"
          className="col-span-2 md:col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="budgetMin"
          value={filters.budgetMin}
          onChange={handleChange}
          placeholder="Min budget (₹)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="budgetMax"
          value={filters.budgetMax}
          onChange={handleChange}
          placeholder="Max budget (₹)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="moveInDate"
          value={filters.moveInDate}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Studio">Studio</option>
          <option value="1BHK">1BHK</option>
          <option value="2BHK">2BHK</option>
          <option value="3BHK">3BHK</option>
          <option value="Villa">Villa</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Search
          </button>
          <button type="button" onClick={handleReset} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}
