import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LeafletUser = ({ onLocationUpdate }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const coords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setPosition([coords.lat, coords.lng]);
          onLocationUpdate(coords); // Send location to parent component
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [onLocationUpdate]);

  return (
    <div className="w-full my-10">
      {position ? (
        <>
          <p>
            <strong>Lokasi Anda: </strong> {position[0]}, {position[1]}
          </p>
          <div className="h-[45vh] w-full md:h-[70vh] border-2">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position}>
                <Popup>You are here! 📍</Popup>
              </Marker>
            </MapContainer>
          </div>
        </>
      ) : (
        <p>Loading location...</p>
      )}
    </div>
  );
};

export default LeafletUser;
