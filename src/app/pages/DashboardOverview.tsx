import { useState } from 'react';
import { Package, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { MapWidget } from '../components/MapWidget';
import { DriverCard } from '../components/DriverCard';
import { DeliveryTimeline } from '../components/DeliveryTimeline';
import { mockDrivers, mockDeliveries, kpiData } from '../lib/mock-data';

export function DashboardOverview() {
  const [drivers] = useState(mockDrivers);
  const [deliveries] = useState(mockDeliveries);
  
  const activeDrivers = drivers.filter(d => d.status === 'delivering');
  const activeDelivery = deliveries.find(d => d.status === 'in-progress' && d.timeline);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Real-time logistics monitoring and management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Deliveries"
          value={kpiData.activeDeliveries}
          icon={Package}
          trend={kpiData.activeDeliveriesTrend}
          color="blue"
        />
        <KPICard
          title="Available Drivers"
          value={kpiData.availableDrivers}
          icon={Users}
          trend={kpiData.availableDriversTrend}
          color="green"
        />
        <KPICard
          title="Completed Today"
          value={kpiData.completedToday}
          icon={CheckCircle}
          trend={kpiData.completedTodayTrend}
          color="green"
        />
        <KPICard
          title="Delayed Deliveries"
          value={kpiData.delayedDeliveries}
          icon={AlertTriangle}
          trend={kpiData.delayedDeliveriesTrend}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Tracking Map</h2>
          <MapWidget drivers={drivers} deliveries={deliveries} height="600px" />
        </div>

        {/* Driver Status Panel */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Active Drivers ({activeDrivers.length})
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {activeDrivers.map(driver => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Timeline */}
      {activeDelivery && activeDelivery.timeline && (
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Active Delivery Timeline - {activeDelivery.orderId}
          </h2>
          <DeliveryTimeline steps={activeDelivery.timeline} />
        </div>
      )}
    </div>
  );
}
