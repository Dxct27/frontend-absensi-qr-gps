import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const LeafletAdmin = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPosition = [location.coords.latitude, location.coords.longitude];
          setPosition(newPosition);
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <div className="w-full my-10">
      {position ? (
        <>
          <p>
            <strong>Selected Location: </strong> {position[0]}, {position[1]}
          </p>
          <div className="h-[45vh] w-full md:h-[70vh] border-2">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={position}
                draggable={true}
                icon={markerIcon}
                eventHandlers={{
                  dragend: (e) => {
                    const newPos = e.target.getLatLng();
                    setPosition([newPos.lat, newPos.lng]);
                  },
                }}
              >
                <Popup>Drag me to set location 📍</Popup>
              </Marker>
            </MapContainer>
          </div>
        </>
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default LeafletAdmin;
