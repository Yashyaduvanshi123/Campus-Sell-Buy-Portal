import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#F3EFE7] text-[#292D32]">
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
