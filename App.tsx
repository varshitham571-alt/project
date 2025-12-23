
import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import RoadSimulation from './components/RoadSimulation';
import Chatbot from './components/Chatbot';
import { SimulationState, RoadType, IMUState, TelemetryPoint, WeatherData, DrivingMode, SafetyStatus } from './types';
import { 
  MAX_SPEED_HIGHWAY, MAX_SPEED_CITY, 
  SAFE_DISTANCE, CRITICAL_DISTANCE,
  ACC_ACCELERATION, ACC_BRAKING,
  MANUAL_ACCELERATION, MANUAL_BRAKING,
  LEAD_CAR_BASE_SPEED_HIGHWAY,
  LEAD_CAR_BASE_SPEED_CITY
} from './constants';

const App: React.FC = () => {
  // --- Simulation State ---
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(130);
  const [fuel, setFuel] = useState(100);
  const [drivingMode, setDrivingMode] = useState<DrivingMode>('Manual');
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [roadType, setRoadType] = useState<RoadType>('highway');
  const [imuState, setImuState] = useState<IMUState>('Stable');
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>('Safe');
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [weather, setWeather] = useState<WeatherData>();
  
  // Internal refs to avoid stale closures in interval
  const distanceRef = useRef(130);
  const speedRef = useRef(0);
  const fuelRef = useRef(100);
  const leadSpeedRef = useRef(90);
  const isEmergencyRef = useRef(false);
  const modeRef = useRef<DrivingMode>('Manual');
  const isPausedRef = useRef(false);
  const roadTypeRef = useRef<RoadType>('highway');

  // Sync refs with state
  useEffect(() => {
    speedRef.current = speed;
    distanceRef.current = distance;
    fuelRef.current = fuel;
    isEmergencyRef.current = emergencyActive;
    modeRef.current = drivingMode;
    isPausedRef.current = isPaused;
    roadTypeRef.current = roadType;
  }, [speed, distance, fuel, emergencyActive, drivingMode, isPaused, roadType]);

  // --- Geolocation & Weather ---
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        const weatherCode = data.current_weather.weathercode;
        const condition = weatherCode < 3 ? 'Clear' : weatherCode < 50 ? 'Cloudy' : 'Rainy';
        
        setWeather({
          temp: data.current_weather.temperature,
          condition: condition,
          location: 'Live Simulation Site'
        });
      } catch (e) {
        setWeather({ temp: 22, condition: 'Clear', location: 'System Default' });
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeather(37.7749, -122.4194) // Default SF
    );
  }, []);

  // --- Handlers ---
  const handleModeChange = (mode: DrivingMode) => {
    if (!emergencyActive && !isPaused) setDrivingMode(mode);
  };

  const handleTogglePause = () => {
    if (!emergencyActive) setIsPaused(prev => !prev);
  };

  const handleReset = () => {
    setSpeed(0);
    setDistance(130);
    setFuel(100);
    setDrivingMode('Manual');
    setEmergencyActive(false);
    setIsPaused(false);
    setImuState('Stable');
    setSafetyStatus('Safe');
    setRoadType('highway');
    setHistory([]);
    leadSpeedRef.current = LEAD_CAR_BASE_SPEED_HIGHWAY;
  };

  const handleEmergency = () => {
    setEmergencyActive(true);
    setDrivingMode('Manual');
    setSpeed(0);
    setImuState('Braking');
    setSafetyStatus('Danger');
  };

  const handleAccelerate = () => {
    if (drivingMode === 'Manual' && !emergencyActive && !isPaused && fuelRef.current > 0) {
      const max = roadType === 'highway' ? MAX_SPEED_HIGHWAY : MAX_SPEED_CITY;
      setSpeed(prev => Math.min(max, prev + MANUAL_ACCELERATION));
      setImuState('Accelerating');
    }
  };

  const handleBrake = () => {
    if (drivingMode === 'Manual' && !emergencyActive && !isPaused) {
      setSpeed(prev => Math.max(0, prev - MANUAL_BRAKING));
      setImuState('Braking');
    }
  };

  const handleRoadChange = (type: RoadType) => {
    setRoadType(type);
    leadSpeedRef.current = type === 'highway' ? LEAD_CAR_BASE_SPEED_HIGHWAY : LEAD_CAR_BASE_SPEED_CITY;
  };

  // --- Core Simulation Engine ---
  useEffect(() => {
    const timer = setInterval(() => {
      if (isEmergencyRef.current || isPausedRef.current) return;

      // 1. Lead Vehicle Dynamics (Traffic Simulation)
      const baseLeadSpeed = roadTypeRef.current === 'highway' ? LEAD_CAR_BASE_SPEED_HIGHWAY : LEAD_CAR_BASE_SPEED_CITY;
      const leadNoise = Math.sin(Date.now() / 4000) * 10; 
      const leadSpike = Math.sin(Date.now() / 12000) > 0.85 ? -25 : 0; 
      leadSpeedRef.current = Math.max(15, baseLeadSpeed + leadNoise + leadSpike);
      
      const speedDiff = leadSpeedRef.current - speedRef.current;
      const distDelta = (speedDiff / 3.6) * 0.1; 
      
      const nextDistance = Math.max(0.5, Math.min(200, distanceRef.current + distDelta));
      setDistance(nextDistance);

      // 2. Control Logic (Adaptive System)
      let currentAccel = 0;
      let nextSpeed = speedRef.current;
      let nextImu: IMUState = 'Stable';

      if (fuelRef.current <= 0) {
        // Run out of fuel logic
        nextSpeed = Math.max(0, nextSpeed - 0.3);
        nextImu = nextSpeed > 0 ? 'Braking' : 'Stable';
      } else if (modeRef.current === 'ACC') {
        const maxAllowedSpeed = roadTypeRef.current === 'highway' ? MAX_SPEED_HIGHWAY : MAX_SPEED_CITY;
        
        // Safety heuristics for academic demonstration
        const distError = nextDistance - SAFE_DISTANCE;
        const relativeVelocity = speedDiff; 

        if (nextDistance < CRITICAL_DISTANCE) {
            currentAccel = -ACC_BRAKING * 4;
            nextImu = 'Braking';
        } else {
            const Kp_dist = 0.03; 
            const Kd_vel = 0.07;
            const Kp_speed = 0.1;

            const speedLimitError = maxAllowedSpeed - nextSpeed;
            const accelFromDistance = distError * Kp_dist + relativeVelocity * Kd_vel;
            const accelFromSpeedLimit = speedLimitError * Kp_speed;

            currentAccel = Math.min(accelFromDistance, accelFromSpeedLimit);
            
            if (currentAccel > ACC_ACCELERATION) currentAccel = ACC_ACCELERATION;
            if (currentAccel < -ACC_BRAKING) currentAccel = -ACC_BRAKING;
            
            if (currentAccel > 0.08) nextImu = 'Accelerating';
            else if (currentAccel < -0.08) nextImu = 'Braking';
            else nextImu = 'Stable';
        }
      } else {
        if (nextSpeed > 0) currentAccel = -0.15; // Drag
      }

      if (fuelRef.current > 0) {
        nextSpeed = Math.max(0, nextSpeed + currentAccel);
      }
      setSpeed(nextSpeed);
      setImuState(nextImu);

      // 3. Fuel Management
      if (nextSpeed > 0 || currentAccel > 0) {
        // Base consumption + speed factor + acceleration factor
        const consumptionBase = 0.002;
        const speedFactor = nextSpeed / 1000;
        const accelFactor = currentAccel > 0 ? currentAccel * 0.05 : 0;
        const totalConsumption = (consumptionBase + speedFactor + accelFactor);
        setFuel(prev => Math.max(0, prev - totalConsumption));
      }

      // 4. Safety Monitoring
      const timeToCollision = nextDistance / (Math.abs(speedDiff) / 3.6 || 0.1);
      const isDangerous = nextDistance < CRITICAL_DISTANCE || (speedDiff < -10 && nextDistance < 40) || timeToCollision < 2;
      setSafetyStatus(isDangerous ? 'Danger' : 'Safe');

      // 5. History Logging
      setHistory(prev => {
        const newPoint = {
          time: Date.now(),
          speed: nextSpeed,
          distance: nextDistance,
          acceleration: currentAccel
        };
        const updated = [...prev, newPoint];
        return updated.slice(-100);
      });

    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden font-sans select-none">
      <div className="flex-1 relative">
        <RoadSimulation 
          speed={speed} 
          distance={distance} 
          roadType={roadType} 
          isPaused={isPaused}
        />
      </div>

      <Dashboard 
        speed={speed}
        distance={distance}
        fuel={fuel}
        drivingMode={drivingMode}
        emergencyActive={emergencyActive}
        isPaused={isPaused}
        imuState={imuState}
        safetyStatus={safetyStatus}
        roadType={roadType}
        history={history}
        weather={weather}
        onModeChange={handleModeChange}
        onEmergency={handleEmergency}
        onAccelerate={handleAccelerate}
        onBrake={handleBrake}
        onRoadChange={handleRoadChange}
        onTogglePause={handleTogglePause}
        onReset={handleReset}
      />

      <Chatbot 
        state={{
          speed,
          distance,
          fuel,
          drivingMode,
          emergencyActive,
          isPaused,
          roadType,
          imuState,
          safetyStatus,
          targetSpeed: roadType === 'highway' ? MAX_SPEED_HIGHWAY : MAX_SPEED_CITY,
          timestamp: Date.now(),
          weather,
          history
        }} 
      />
    </div>
  );
};

export default App;
