import React, { useState } from "react";
import {
  Home,
  Package,
  Truck,
  User,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  CheckCircle,
  Navigation,
  AlertCircle,
} from "lucide-react";

// ==================== DELIVERY DRIVER BOTTOM TABS ====================
const DeliveryBottomTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "ready", icon: Package, label: "Ready", color: "orange" },
    { id: "active", icon: Truck, label: "Active", color: "blue" },
    { id: "profile", icon: User, label: "Profile", color: "purple" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-20 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const colorClasses = {
            orange: isActive ? "text-orange-500" : "text-gray-400",
            blue: isActive ? "text-blue-500" : "text-gray-400",
            purple: isActive ? "text-purple-500" : "text-gray-400",
          };

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:scale-110"
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  isActive ? `bg-${tab.color}-50` : "bg-transparent"
                }`}
              >
                <Icon className={`w-6 h-6 ${colorClasses[tab.color]}`} />
              </div>
              <span
                className={`text-xs font-medium ${colorClasses[tab.color]}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==================== READY FOR PICKUP SCREEN ====================
const ReadyOrdersScreen = () => {
  const [orders] = useState([
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      customer: {
        firstName: "John",
        lastName: "Doe",
        phone: "+27 11 234 5678",
      },
      address: "123 Main Street, Sandton, Johannesburg",
      items: 5,
      total: 345.5,
      pickupCode: "P1A2B3",
      readyTime: "2:30 PM",
      specialInstructions: "Call customer on arrival",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      customer: {
        firstName: "Sarah",
        lastName: "Smith",
        phone: "+27 11 345 6789",
      },
      address: "456 Oak Avenue, Rosebank, Johannesburg",
      items: 3,
      total: 189.99,
      pickupCode: "C4D5E6",
      readyTime: "2:45 PM",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ready for Pickup
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {orders.length} orders waiting
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Order Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Order #{order.orderNumber.split("-").pop()}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-orange-100" />
                    <span className="text-sm text-orange-100">
                      Ready at {order.readyTime}
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-white text-xs font-bold uppercase">
                    Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {order.customer.firstName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer.phone}
                    </p>
                  </div>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Address */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700 flex-1">{order.address}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="font-semibold text-gray-900">
                  {order.items} items
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-lg font-bold text-orange-600">
                  R {order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="px-6 py-3 bg-yellow-50 border-y border-yellow-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    {order.specialInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Pickup Code */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2 text-center">
                Pickup Code
              </p>
              <div className="bg-white border-2 border-dashed border-orange-300 rounded-xl p-4 text-center">
                <span className="text-3xl font-bold text-orange-600 tracking-wider">
                  {order.pickupCode}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="px-6 py-4">
              <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Confirm Pickup & Start Delivery
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== ACTIVE DELIVERIES SCREEN ====================
const ActiveDeliveriesScreen = () => {
  const [deliveries] = useState([
    {
      id: "1",
      orderNumber: "ORD-2024-003",
      customer: {
        firstName: "Michael",
        lastName: "Brown",
        phone: "+27 11 456 7890",
      },
      address: "789 Park Lane, Morningside, Johannesburg",
      items: 4,
      total: 278.0,
      pickedUpAt: "3:15 PM",
      specialInstructions: "Ring doorbell twice",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Active Deliveries
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {deliveries.length} delivery in progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Deliveries
            </h3>
            <p className="text-gray-500 text-center px-8">
              Pick up orders from the Ready tab to start delivering
            </p>
          </div>
        ) : (
          deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Order #{delivery.orderNumber.split("-").pop()}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-blue-100" />
                      <span className="text-sm text-blue-100">
                        Picked up at {delivery.pickedUpAt}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-white text-xs font-bold uppercase">
                      In Delivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info with Call Button */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {delivery.customer.firstName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {delivery.customer.firstName}{" "}
                        {delivery.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {delivery.customer.phone}
                      </p>
                    </div>
                  </div>
                  <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Address with Navigate Button */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700 flex-1">
                    {delivery.address}
                  </p>
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Navigate to Address
                </button>
              </div>

              {/* Order Summary */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="font-semibold text-gray-900">
                    {delivery.items} items
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-lg font-bold text-blue-600">
                    R {delivery.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Special Instructions */}
              {delivery.specialInstructions && (
                <div className="px-6 py-3 bg-yellow-50 border-y border-yellow-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      {delivery.specialInstructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Mark Delivered Button */}
              <div className="px-6 py-4">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Mark as Delivered
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==================== DRIVER PROFILE SCREEN ====================
const DriverProfileScreen = () => {
  const [status, setStatus] = useState("available");

  const statusConfig = {
    available: { color: "green", label: "Available", icon: CheckCircle },
    busy: { color: "yellow", label: "Busy", icon: Truck },
    offline: { color: "gray", label: "Offline", icon: User },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-lg mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Driver Profile</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-4xl font-bold text-purple-600">JD</span>
            </div>
            <h2 className="text-2xl font-bold text-white">John Doe</h2>
            <p className="text-purple-100 text-sm mt-1">Driver ID: 12345678</p>
          </div>

          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Phone Number</span>
              <span className="font-semibold text-gray-900">
                +27 11 234 5678
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold text-gray-900">
                john@example.com
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Current Orders</span>
              <span className="font-bold text-purple-600">1</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Current Status</h3>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-4 h-4 rounded-full bg-${currentStatus.color}-500 animate-pulse`}
              ></div>
              <span
                className={`text-xl font-bold capitalize text-${currentStatus.color}-700`}
              >
                {currentStatus.label}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setStatus("available")}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  status === "available"
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Set as Available
              </button>
              <button
                onClick={() => setStatus("busy")}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  status === "busy"
                    ? "bg-yellow-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Set as Busy
              </button>
              <button
                onClick={() => setStatus("offline")}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  status === "offline"
                    ? "bg-gray-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Go Offline
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Today's Summary</h3>
          </div>
          <div className="px-6 py-6">
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-1">1</div>
                <div className="text-xs text-gray-500">Active Orders</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-1">8</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button className="w-full px-6 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Order History</span>
              <span className="text-gray-400">›</span>
            </div>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-red-50 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-medium text-red-600">Logout</span>
              <span className="text-red-400">›</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
export default function DeliveryDriverApp() {
  const [activeTab, setActiveTab] = useState("ready");

  const renderScreen = () => {
    switch (activeTab) {
      case "ready":
        return <ReadyOrdersScreen />;
      case "active":
        return <ActiveDeliveriesScreen />;
      case "profile":
        return <DriverProfileScreen />;
      default:
        return <ReadyOrdersScreen />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {renderScreen()}
      <DeliveryBottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
