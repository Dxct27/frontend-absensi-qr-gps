import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LeafletUser = ({ onLocationUpdate, onLocationError }) => {
  const [position, setPosition] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const intervalDuration = 5000;

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setErrorMsg("Geolocation tidak didukung oleh browser ini.");
      onLocationError && onLocationError("Geolocation tidak didukung.");
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    };

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const coords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setPosition([coords.lat, coords.lng]);
          onLocationUpdate(coords);
        },
        (err) => {
          let message = "Gagal mendapatkan lokasi.";
          if (err.code === 1)
            message = "Izin lokasi ditolak! Harap aktifkan GPS, lalu refresh halaman.";
          else if (err.code === 2) message = "Lokasi tidak tersedia.";
          else if (err.code === 3) message = "Permintaan lokasi timeout. Harap refresh halaman.";

          setErrorMsg(message);
          onLocationError && onLocationError(message);
        },
        geoOptions
      );
    };

    getLocation();
    const intervalId = setInterval(getLocation, intervalDuration);

    return () => clearInterval(intervalId);
  }, [onLocationUpdate, onLocationError]);

  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <div className="w-full my-10">
      {errorMsg ? (
        <p className="text-red-500">{errorMsg}</p>
      ) : position ? (
        <>
          <p>
            <strong>Lokasi Anda: </strong> {position[0]}, {position[1]}
          </p>
          <div className="h-[45vh] w-full md:h-[70vh] border-2">
            <MapContainer
              center={position}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} icon={markerIcon}>
                <Popup>Anda di sini! 📍</Popup>
              </Marker>
            </MapContainer>
          </div>
        </>
      ) : (
        <p>Memuat lokasi...</p>
      )}
    </div>
  );
};

export default LeafletUser;
