import { useEffect, useState } from 'react';
import socket from '../socket/socket';
import api from '../api';
import { useAuth } from '../context/AuthContext'; // 🔥 Behozzuk az Auth-ot
import { translations } from '../utils/translations'; // 🔥 Behozzuk a szótárat

export default function MyTrackers({ user }) {
  const [trackers, setTrackers] = useState([]);
  
  // 🔥 Lekérjük az aktuális nyelvet
  const { language } = useAuth();
  const t = translations[language] || translations.hu;

  useEffect(() => {
    // első betöltés
    api.get('/api/trackers').then(res => {
      setTrackers(res.data);
    });

    socket.on('tracker_created', ({ ownerId, tracker }) => {
      if (ownerId === user.id) {
        setTrackers(prev => [tracker, ...prev]);
      }
    });

    socket.on('tracker_updated', ({ ownerId, tracker }) => {
      if (ownerId === user.id) {
        setTrackers(prev =>
          prev.map(t => (t._id === tracker._id ? tracker : t))
        );
      }
    });

    socket.on('tracker_deleted', ({ ownerId, trackerId }) => {
      if (ownerId === user.id) {
        setTrackers(prev =>
          prev.filter(t => t._id !== trackerId)
        );
      }
    });

    return () => {
      socket.off('tracker_created');
      socket.off('tracker_updated');
      socket.off('tracker_deleted');
    };
  }, [user.id]);

  return (
    <div>
      {/* ✅ Most már a szótárból olvassa a címet! */}
      <h2>{t.myTrackers}</h2> 
      
      {trackers.map(t => (
        <div key={t._id}>{t.name}</div>
      ))}
    </div>
  );
}