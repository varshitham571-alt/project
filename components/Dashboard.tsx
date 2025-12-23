
import React from 'react';
import { IMUState, RoadType, TelemetryPoint, WeatherData, DrivingMode, SafetyStatus } from '../types';
import TelemetryGraphs from './TelemetryGraphs';
import WeatherInfo from './WeatherInfo';

interface DashboardProps {
  speed: number;
  distance: number;
  fuel: number;
  drivingMode: DrivingMode;
  emergencyActive: boolean;
  isPaused: boolean;
  imuState: IMUState;
  safetyStatus: SafetyStatus;
  roadType: RoadType;
  history: TelemetryPoint[];
  weather?: WeatherData;
  onModeChange: (mode: DrivingMode) => void;
  onEmergency: () => void;
  onAccelerate: () => void;
  onBrake: () => void;
  onRoadChange: (type: RoadType) => void;
  onTogglePause: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  speed,
  distance,
  fuel,
  drivingMode,
  emergencyActive,
  isPaused,
  imuState,
  safetyStatus,
  roadType,
  history,
  weather,
  onModeChange,
  onEmergency,
  onAccelerate,
  onBrake,
  onRoadChange,
  onTogglePause,
  onReset,
}) => {
  const speedPercent = Math.min(100, (speed / 120) * 100);
  const distancePercent = Math.max(0, Math.min(100, (distance / 200) * 100));
  const fuelPercent = Math.max(0, Math.min(100, fuel));

  // Determine Alerts
  const alerts = [];
  if (emergencyActive) alerts.push({ text: "Emergency Mode Active", color: "text-red-500", icon: "⚠️" });
  if (fuel < 5) alerts.push({ text: "Refuel Needed", color: "text-red-500", icon: "⛽" });
  else if (fuel < 20) alerts.push({ text: "Low Fuel", color: "text-yellow-500", icon: "⛽" });
  if (distance < 25) alerts.push({ text: "Distance Danger", color: "text-red-600", icon: "📏" });

  return (
    <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-black text-white border-t border-gray-800 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] z-50">
      
      {/* Telemetry Core Panel */}
      <div className="lg:col-span-3 flex flex-col gap-3 border border-gray-800 p-5 rounded-xl bg-gray-900/10 backdrop-blur-md">
        <div className="flex justify-between items-center mb-1">
          <WeatherInfo data={weather} />
          <div className={`px-4 py-1.5 rounded-full text-[11px] font-black border transition-all duration-300 shadow-lg ${
            safetyStatus === 'Safe' ? 'bg-green-950/40 text-green-400 border-green-500/50 shadow-green-500/10' : 'bg-red-950/60 text-red-500 border-red-500 animate-pulse shadow-red-500/20'
          }`}>
            {safetyStatus.toUpperCase()}
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Speed</span>
          <span className="text-4xl font-black text-white tabular-nums">{speed.toFixed(0)} <span className="text-sm font-normal text-gray-600">KM/H</span></span>
        </div>
        <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-800 p-[1px]">
          <div 
            className={`h-full transition-all duration-300 ease-out rounded-full ${
              imuState === 'Accelerating' ? 'bg-green-400 shadow-[0_0_15px_#4ade80]' : 
              imuState === 'Braking' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 
              'bg-blue-500 shadow-[0_0_10px_#3b82f6]'
            }`} 
            style={{ width: `${speedPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-end mt-1">
          <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Obstacle Gap</span>
          <span className="text-4xl font-black text-white tabular-nums">{distance.toFixed(1)} <span className="text-sm font-normal text-gray-600">M</span></span>
        </div>
        <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-800 p-[1px]">
          <div 
            className={`h-full transition-all duration-300 ease-out rounded-full ${distance < 30 ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-yellow-500 shadow-[0_0_15px_#eab308]'}`} 
            style={{ width: `${distancePercent}%` }}
          />
        </div>

        <div className="flex justify-between items-end mt-1">
          <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Fuel Level</span>
          <span className="text-xl font-black text-white tabular-nums">{fuel.toFixed(1)} <span className="text-xs font-normal text-gray-600">%</span></span>
        </div>
        <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-800 p-[1px]">
          <div 
            className={`h-full transition-all duration-300 ease-out rounded-full ${fuel < 20 ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-blue-600 shadow-[0_0_15px_#3b82f6]'}`} 
            style={{ width: `${fuelPercent}%` }}
          />
        </div>
      </div>

      {/* Control Surface Module */}
      <div className="lg:col-span-3 flex flex-col gap-4 border border-gray-800 p-5 rounded-xl bg-gray-900/10 backdrop-blur-md">
        <div className="flex gap-3 mb-1">
          <button 
            onClick={() => onModeChange('ACC')}
            disabled={emergencyActive || isPaused}
            className={`flex-1 py-3 rounded-lg font-black text-[11px] uppercase transition-all border-2 ${
                drivingMode === 'ACC' ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
            }`}
          >
            ACC
          </button>
          <button 
            onClick={() => onModeChange('Manual')}
            disabled={emergencyActive || isPaused}
            className={`flex-1 py-3 rounded-lg font-black text-[11px] uppercase transition-all border-2 ${
                drivingMode === 'Manual' ? 'bg-emerald-700 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
            }`}
          >
            Manual
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
            <button 
                onMouseDown={onAccelerate}
                disabled={drivingMode === 'ACC' || emergencyActive || isPaused || fuel <= 0}
                className="bg-gray-800 hover:bg-green-600 text-white text-[11px] font-black py-4 rounded-lg border border-gray-700 disabled:opacity-20 transition-all uppercase flex flex-col items-center gap-1 active:scale-95"
            >
                <span className="text-xl">▲</span>
                Accelerate
            </button>
            <button 
                onMouseDown={onBrake}
                disabled={drivingMode === 'ACC' || emergencyActive || isPaused}
                className="bg-gray-800 hover:bg-red-700 text-white text-[11px] font-black py-4 rounded-lg border border-gray-700 disabled:opacity-20 transition-all uppercase flex flex-col items-center gap-1 active:scale-95"
            >
                <span className="text-xl">▼</span>
                Brake
            </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
            <select 
                value={roadType} 
                onChange={(e) => onRoadChange(e.target.value as RoadType)}
                className="bg-gray-800 text-blue-400 text-[11px] font-black py-2 rounded-lg border border-gray-700 outline-none cursor-pointer uppercase text-center hover:bg-gray-700 transition-colors"
            >
                <option value="highway">Highway</option>
                <option value="city">City</option>
            </select>
            <button onClick={onTogglePause} className="bg-gray-800 text-gray-400 text-[11px] font-black py-2 rounded-lg border border-gray-700 uppercase hover:text-white transition-all">
                {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={onReset} className="bg-gray-800 text-gray-400 text-[11px] font-black py-2 rounded-lg border border-gray-700 uppercase hover:text-white transition-all">
                Reset
            </button>
        </div>
      </div>

      {/* Analytics & Alerts */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="h-1/2 flex flex-col gap-1 overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <div className="bg-green-950/10 border border-green-900/30 rounded-lg p-3 text-center">
              <span className="text-[10px] font-black text-green-700 tracking-widest uppercase italic">All Systems Normal • Telemetry Stable</span>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <div key={idx} className={`bg-black/40 border border-gray-800 flex items-center gap-3 px-4 py-2 rounded-lg ${alert.color} border-l-4 ${alert.color.replace('text', 'border')}`}>
                <span className="text-lg">{alert.icon}</span>
                <span className="text-[11px] font-black uppercase tracking-widest italic">{alert.text}</span>
              </div>
            ))
          )}
        </div>
        <TelemetryGraphs history={history} />
      </div>

      {/* Kill Switch */}
      <div className="lg:col-span-2 flex flex-col">
        <button 
            onClick={onEmergency}
            className={`h-full w-full flex flex-col justify-center items-center gap-3 rounded-xl transition-all border-4 ${
                emergencyActive ? 'bg-red-600 border-white animate-pulse shadow-[0_0_50px_rgba(255,0,0,1)]' : 'bg-red-950/20 border-red-900/40 hover:bg-red-900/50'
            }`}
        >
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-1 border-2 border-white/40 shadow-xl">!</div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase">Emergency</span>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest opacity-60">System Lock</span>
        </button>
      </div>

      {/* Critical Modal */}
      {emergencyActive && (
         <div className="fixed inset-0 bg-red-950/98 backdrop-blur-2xl z-[500] flex items-center justify-center pointer-events-none">
            <div className="bg-black p-20 border-4 border-red-600 rounded-[50px] shadow-[0_0_200px_rgba(255,0,0,1)] text-center animate-in fade-in zoom-in duration-500 flex flex-col items-center">
               <div className="text-red-600 text-[120px] mb-4 font-black leading-none italic animate-bounce">STOP</div>
               <h2 className="text-5xl font-black text-white mb-6 tracking-tight uppercase">Emergency Mode Active</h2>
               <p className="text-xl font-mono text-red-500 mb-14 uppercase tracking-widest max-w-md">Vehicle speed locked at zero. Adaptive systems disengaged. Visual proximity hazard detected.</p>
               <button 
                  onClick={(e) => { e.stopPropagation(); onReset(); }}
                  className="pointer-events-auto bg-white text-black px-24 py-6 rounded-full font-black text-2xl uppercase hover:bg-gray-100 transition-all transform hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.5)]"
               >
                  Reboot System
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default Dashboard;
