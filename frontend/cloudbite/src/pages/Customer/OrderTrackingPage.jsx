import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { apiUrl } from "../../config/apiBase";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { ThemeContext } from "../../context/ThemeContext";
import { ArrowLeft, CheckCircle, Loader2, Store, Home } from "lucide-react";

const API_BASE = apiUrl("");

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Bike SVG icon (replaces car) ──────────────────────────────────────────
function createBikeIcon(heading = 0) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      <g transform="rotate(${heading}, 21, 21)">
        <!-- rear wheel -->
        <circle cx="10" cy="29" r="7" fill="none" stroke="#111827" stroke-width="2.5"/>
        <circle cx="10" cy="29" r="2" fill="#111827"/>
        <!-- front wheel -->
        <circle cx="32" cy="29" r="7" fill="none" stroke="#111827" stroke-width="2.5"/>
        <circle cx="32" cy="29" r="2" fill="#111827"/>
        <!-- frame: chain stay -->
        <line x1="10" y1="29" x2="21" y2="16" stroke="#F97316" stroke-width="2.5" stroke-linecap="round"/>
        <!-- frame: seat stay -->
        <line x1="10" y1="29" x2="24" y2="20" stroke="#F97316" stroke-width="2" stroke-linecap="round"/>
        <!-- frame: down tube -->
        <line x1="21" y1="16" x2="32" y2="29" stroke="#F97316" stroke-width="2.5" stroke-linecap="round"/>
        <!-- frame: top tube -->
        <line x1="21" y1="16" x2="28" y2="16" stroke="#F97316" stroke-width="2" stroke-linecap="round"/>
        <!-- fork -->
        <line x1="28" y1="16" x2="32" y2="29" stroke="#F97316" stroke-width="2" stroke-linecap="round"/>
        <!-- handlebar -->
        <line x1="27" y1="13" x2="30" y2="13" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
        <line x1="28.5" y1="13" x2="28.5" y2="16" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
        <!-- seat post -->
        <line x1="21" y1="16" x2="21" y2="11" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
        <!-- seat -->
        <line x1="18" y1="11" x2="24" y2="11" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
        <!-- rider head -->
        <circle cx="26" cy="9" r="3" fill="#F97316" stroke="white" stroke-width="1.5"/>
        <!-- delivery box on rear -->
        <rect x="5" y="20" width="8" height="6" rx="1" fill="#F97316" stroke="white" stroke-width="1"/>
        <line x1="9" y1="20" x2="9" y2="26" stroke="white" stroke-width="0.8"/>
      </g>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });
}

// ── Kitchen pin ───────────────────────────────────────────────────────────
function createKitchenIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="42" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
      <path d="M18 0 C8 0 0 8 0 18 C0 30 18 44 18 44 C18 44 36 30 36 18 C36 8 28 0 18 0Z" fill="#F97316"/>
      <rect x="10" y="12" width="16" height="12" rx="2" fill="white"/>
      <rect x="14" y="18" width="8" height="6" rx="1" fill="#F97316"/>
    </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44] });
}

// ── Customer pin ──────────────────────────────────────────────────────────
function createCustomerIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="42" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
      <path d="M18 0 C8 0 0 8 0 18 C0 30 18 44 18 44 C18 44 36 30 36 18 C36 8 28 0 18 0Z" fill="#3B82F6"/>
      <polygon points="18,9 27,17 9,17" fill="white"/>
      <rect x="12" y="17" width="12" height="10" rx="1" fill="white"/>
      <rect x="15" y="21" width="6" height="6" rx="1" fill="#3B82F6"/>
    </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44] });
}

// ── Heading calc ──────────────────────────────────────────────────────────
function calcHeading(prev, curr) {
  if (!prev) return 0;
  return ((Math.atan2(curr.lng - prev.lng, curr.lat - prev.lat) * 180) / Math.PI + 360) % 360;
}

// ── Distance ──────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── OSRM route fetch (frontend, no API key) ───────────────────────────────
async function fetchOsrmRoute(kitchen, customer) {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${kitchen.lng},${kitchen.lat};${customer.lng},${customer.lat}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const json = await res.json();
    const coords = json.routes[0].geometry.coordinates; // [lng, lat]
    return coords.map(([lng, lat]) => [lat, lng]);       // → [lat, lng]
  } catch {
    // Fallback: straight line with 60 points
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      pts.push([
        kitchen.lat + (customer.lat - kitchen.lat) * t,
        kitchen.lng + (customer.lng - kitchen.lng) * t,
      ]);
    }
    return pts;
  }
}

// ── First-load map fitter (fits all 3 markers, no minZoom so any distance works) ──
function MapFitter({ kitchen, customer, car }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && kitchen && customer && car) {
      const bounds = L.latLngBounds([
        [kitchen.lat, kitchen.lng],
        [customer.lat, customer.lng],
        [car.lat, car.lng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      fitted.current = true;
    }
  }, [kitchen, customer, car, map]);
  return null;
}

// ── Smooth pan to keep bike on screen ─────────────────────────────────────
function BikeFollower({ car }) {
  const map = useMap();
  useEffect(() => {
    if (car) map.panTo([car.lat, car.lng], { animate: true, duration: 1.2 });
  }, [car, map]);
  return null;
}

// ── Split road polyline at current bike position ───────────────────────────
// Returns { travelled: [[lat,lng]...], remaining: [[lat,lng]...] }
function splitRoute(routePts, carLat, carLng) {
  if (!routePts || routePts.length < 2) return { travelled: [], remaining: [] };

  // Find the segment closest to the current bike position
  let minDist = Infinity;
  let splitIdx = 0;
  for (let i = 0; i < routePts.length - 1; i++) {
    const [lat, lng] = routePts[i];
    const d = haversineKm(carLat, carLng, lat, lng);
    if (d < minDist) { minDist = d; splitIdx = i; }
  }

  return {
    travelled: routePts.slice(0, splitIdx + 1).concat([[carLat, carLng]]),
    remaining: [[carLat, carLng]].concat(routePts.slice(splitIdx + 1)),
  };
}

// ─────────────────────────────────────────────────────────────────────────
export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const [data, setData] = useState(null);
  const [heading, setHeading] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [error, setError] = useState(false);
  const [routePts, setRoutePts] = useState(null);   // full OSRM road polyline
  const [followBike, setFollowBike] = useState(false); // after initial fit, follow bike

  const intervalRef = useRef(null);
  const prevLocRef = useRef(null);
  const routeFetchedRef = useRef(false);

  // Poll backend for bike position
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get(`${API_BASE}/location/${orderId}`);
        const d = res.data;
        const newLoc = { lat: d.latitude, lng: d.longitude };
        if (prevLocRef.current) setHeading(calcHeading(prevLocRef.current, newLoc));
        prevLocRef.current = newLoc;
        setData(d);
        if (d.arrived) { setArrived(true); clearInterval(intervalRef.current); }
      } catch {
        setError(true);
        clearInterval(intervalRef.current);
      }
    };
    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, 4000);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  // Once we have kitchen + customer coords, fetch OSRM route once
  useEffect(() => {
    if (!data || routeFetchedRef.current) return;
    routeFetchedRef.current = true;
    const kitchen  = { lat: data.kitchenLat,  lng: data.kitchenLng };
    const customer = { lat: data.customerLat, lng: data.customerLng };
    fetchOsrmRoute(kitchen, customer).then((pts) => {
      setRoutePts(pts);
      // after a short delay, switch to bike-follow mode
      setTimeout(() => setFollowBike(true), 3000);
    });
  }, [data]);

  const car      = data ? { lat: data.latitude,   lng: data.longitude }   : null;
  const kitchen  = data ? { lat: data.kitchenLat,  lng: data.kitchenLng }  : null;
  const customer = data ? { lat: data.customerLat, lng: data.customerLng } : null;
  const kitchenName     = data?.kitchenName     || "Kitchen";
  const kitchenAddress  = data?.kitchenAddress  || "Mulund West, Mumbai";
  const customerName    = data?.customerName    || "Your location";
  const customerAddress = data?.customerAddress || "";

  const distKm = car && customer
    ? haversineKm(car.lat, car.lng, customer.lat, customer.lng)
    : null;
  const totalDistKm = kitchen && customer
    ? haversineKm(kitchen.lat, kitchen.lng, customer.lat, customer.lng)
    : null;
  const etaMinutes = distKm != null ? Math.ceil((distKm / 20) * 60) : null;
  const progress   = data ? Math.round((data.currentStep / data.totalSteps) * 100) : 0;

  // Split the road route into travelled (orange) and remaining (blue dashed)
  const { travelled, remaining } = car && routePts
    ? splitRoute(routePts, car.lat, car.lng)
    : { travelled: [], remaining: [] };

  // Fallback straight lines when OSRM not loaded yet
  const travelledLine = travelled.length > 1 ? travelled
    : (car && kitchen ? [[kitchen.lat, kitchen.lng], [car.lat, car.lng]] : []);
  const remainingLine = remaining.length > 1 ? remaining
    : (car && customer ? [[car.lat, car.lng], [customer.lat, customer.lng]] : []);

  const dark  = isDarkMode;
  const card  = `rounded-2xl border p-3 ${dark ? "bg-[#1c2231] border-white/10" : "bg-white border-gray-100 shadow-sm"}`;
  const label = `text-[9px] font-black uppercase tracking-widest mb-0.5`;
  const value = `text-xs font-bold ${dark ? "text-white" : "text-gray-900"}`;
  const sub   = `text-[10px] ${dark ? "text-gray-400" : "text-gray-500"}`;

  return (
    <div className={`min-h-screen ${dark ? "bg-[#0f1623]" : "bg-gray-50"}`}>

      {/* Header */}
      <div className={`px-4 py-4 flex items-center gap-3 border-b ${dark ? "bg-[#1c2231] border-white/5" : "bg-white border-gray-100"}`}>
        <button onClick={() => navigate(-1)} className={`p-2 rounded-xl ${dark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">Live Tracking</p>
          <h1 className={`text-lg font-black italic tracking-tighter truncate ${dark ? "text-white" : "text-gray-900"}`}>
            ORDER <span className="text-orange-500">#{orderId}</span>
          </h1>
        </div>
        {etaMinutes != null && !arrived && (
          <div className="text-right shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">ETA</p>
            <p className={`text-lg font-black ${dark ? "text-white" : "text-gray-900"}`}>~{etaMinutes} min</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {data && !arrived && (
        <div className={`px-4 py-2 border-b ${dark ? "border-white/5 bg-[#1c2231]" : "border-gray-100 bg-white"}`}>
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span className="flex items-center gap-1 text-orange-500"><Store size={10}/> {kitchenName}</span>
            <span className={dark ? "text-gray-400" : "text-gray-500"}>{progress}%</span>
            <span className="flex items-center gap-1 text-blue-500"><Home size={10}/> You</span>
          </div>
          <div className={`w-full rounded-full h-1.5 ${dark ? "bg-white/10" : "bg-gray-100"}`}>
            <div className="h-1.5 rounded-full bg-orange-500 transition-all duration-700" style={{ width: `${progress}%` }}/>
          </div>
        </div>
      )}

      {/* Arrived */}
      {arrived && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-green-500 flex items-center gap-3 text-black">
          <CheckCircle size={18} strokeWidth={3}/>
          <p className="font-black text-sm uppercase tracking-widest">Your order has arrived!</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <p className="font-black text-red-500 text-sm">Tracking signal lost. Please go back and try again.</p>
        </div>
      )}

      {/* Loading */}
      {!data && !error && (
        <div className="flex flex-col items-center justify-center mt-24 gap-4">
          <Loader2 className="animate-spin text-orange-500" size={28}/>
          <p className="font-black italic text-orange-500 text-[10px] uppercase tracking-[0.3em]">Acquiring signal...</p>
        </div>
      )}

      {/* Info cards */}
      {data && (
        <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
          <div className={card}>
            <p className={`${label} text-orange-500`}>Outlet</p>
            <p className={value}>{kitchenName}</p>
            <p className={sub}>{kitchenAddress}</p>
          </div>
          <div className={card}>
            <p className={`${label} text-blue-500`}>Delivering to</p>
            <p className={value}>{customerName}</p>
            <p className={sub}>{customerAddress}</p>
          </div>
        </div>
      )}

      {/* Distance row */}
      {distKm != null && !arrived && (
        <div className="mx-4 mt-2 grid grid-cols-3 gap-2">
          <div className={card + " text-center"}>
            <p className={`${label} text-orange-500`}>Remaining</p>
            <p className={value}>{distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`}</p>
          </div>
          <div className={card + " text-center"}>
            <p className={`${label} text-orange-500`}>Total dist</p>
            <p className={value}>
              {totalDistKm != null
                ? totalDistKm < 1
                  ? `${Math.round(totalDistKm * 1000)} m`
                  : `${totalDistKm.toFixed(1)} km`
                : "--"}
            </p>
          </div>
          <div className={card + " text-center"}>
            <p className={`${label} text-orange-500`}>ETA</p>
            <p className={value}>~{etaMinutes} min</p>
          </div>
        </div>
      )}

      {/* Map */}
      {car && kitchen && customer && (
        <div
          className={`mx-4 mt-3 mb-6 rounded-2xl overflow-hidden shadow-lg border ${dark ? "border-white/10" : "border-gray-200"}`}
          style={{ height: "360px" }}
        >
          <MapContainer
            center={[car.lat, car.lng]}
            zoom={14}
            minZoom={11}
            maxZoom={19}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            {/* High-detail tile layer -- shows road names and turns clearly */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={19}
            />

            {/* Fit bounds on first load */}
            {!followBike && <MapFitter kitchen={kitchen} customer={customer} car={car} />}

            {/* Follow bike after initial fit */}
            {followBike && <BikeFollower car={car} />}

            {/* Travelled path: orange solid, follows road */}
            {travelledLine.length > 1 && (
              <Polyline
                positions={travelledLine}
                pathOptions={{ color: "#F97316", weight: 5, opacity: 0.95 }}
              />
            )}

            {/* Remaining path: blue dashed, follows road */}
            {remainingLine.length > 1 && (
              <Polyline
                positions={remainingLine}
                pathOptions={{ color: "#3B82F6", weight: 4, opacity: 0.8, dashArray: "10 6" }}
              />
            )}

            <Marker position={[kitchen.lat, kitchen.lng]} icon={createKitchenIcon()}>
              <Popup><strong>{kitchenName}</strong><br/>{kitchenAddress}</Popup>
            </Marker>
            <Marker position={[customer.lat, customer.lng]} icon={createCustomerIcon()}>
              <Popup><strong>{customerName}</strong><br/>{customerAddress}</Popup>
            </Marker>
            <Marker position={[car.lat, car.lng]} icon={createBikeIcon(heading)}>
              <Popup>Delivery partner</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
}