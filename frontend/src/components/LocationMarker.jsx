import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { THEME } from '../styles/theme';

// Senior tipp: Egyedi ikon létrehozása, hogy jobban nézzen ki, mint az alap kék csepp
const customIcon = new L.Icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
});

const LocationMarker = ({ position, name, lastSeen }) => {
    return (
        <Marker position={position} icon={customIcon}>
            <Popup>
                <div style={{ textAlign: 'center' }}>
                    <strong style={{ color: THEME.primary }}>{name}</strong>
                    <br />
                    <small style={{ color: '#666' }}>Utoljára látva: {lastSeen}</small>
                </div>
            </Popup>
        </Marker>
    );
};

export default LocationMarker;