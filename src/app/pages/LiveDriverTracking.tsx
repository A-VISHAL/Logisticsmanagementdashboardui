import { useState } from 'react';
import { MapWidget } from '../components/MapWidget';
import { DriverCard } from '../components/DriverCard';
import { StatusBadge } from '../components/StatusBadge';
import { mockDrivers, mockDeliveries } from '../lib/mock-data';

export function LiveDriverTracking() {
  const [drivers] = useState(mockDrivers);
  const [deliveries] = useState(mockDeliveries);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'delivering' | 'offline'>('all');

  const filteredDrivers = filterStatus === 'all' 
    ? drivers 
    : drivers.filter(d => d.status === filterStatus);

  const statusCounts = {
    available: drivers.filter(d => d.status === 'available').length,
    delivering: drivers.filter(d => d.status === 'delivering').length,
    offline: drivers.filter(d => d.status === 'offline').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Driver Tracking</h1>
        <p className="text-gray-600 mt-1">Monitor all drivers in real-time</p>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({drivers.length})
        </button>
        <button
          onClick={() => setFilterStatus('available')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'available'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Available ({statusCounts.available})
        </button>
        <button
          onClick={() => setFilterStatus('delivering')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'delivering'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Delivering ({statusCounts.delivering})
        </button>
        <button
          onClick={() => setFilterStatus('offline')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'offline'
              ? 'bg-gray-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Offline ({statusCounts.offline})
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <MapWidget drivers={filteredDrivers} deliveries={deliveries} height="700px" />
        </div>

        {/* Driver List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Drivers ({filteredDrivers.length})
          </h2>
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
            {filteredDrivers.map(driver => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
