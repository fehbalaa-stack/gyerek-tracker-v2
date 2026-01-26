import React from 'react';

export function SoftParentBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-[#F8FAFC]"> 
      {/* Nagyon lágy, szinte láthatatlan menta gradiens a bal felső sarokban */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      
      {/* Finom textúra a háttérben, ami prémium papír hatást kelt */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3 ForeignObject%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
}