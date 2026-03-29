import React from "react";
import { Outlet } from "react-router-dom";
import DeliverySidebar from "./DeliverySidebar";

const DeliveryLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <DeliverySidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col mt-20">

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DeliveryLayout;
