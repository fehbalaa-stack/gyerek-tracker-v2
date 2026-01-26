export const getPublicTracker = async (req, res) => {
  try {
    const { code } = req.params;
    const tracker = await Tracker.findOne({ uniqueCode: code });

    if (!tracker) return res.status(404).json({ success: false });

    const owner = await User.findById(tracker.owner);
    
    // 1. AZONNALI NAPLÓZÁS (GeoJSON kompatibilis módon)
    // Megadjuk a [0, 0] koordinátákat, hogy a Modell 'required' szabálya ne dobjon hibát
    try {
      await Log.create({
        trackerId: tracker._id,
        ownerId: tracker.owner,
        type: 'SCAN',
        deviceInfo: req.headers['user-agent'] || "Ismeretlen eszköz",
        location: {
          type: 'Point',
          coordinates: [0, 0] // Ideiglenes [Long, Lat], amíg a frontend nem küldi a pontosat
        },
        date: new Date()
      });
      console.log("✅ Kezdeti log rögzítve a szkenneléshez.");
    } catch (logErr) {
      console.error("⚠️ Kezdeti log mentési hiba:", logErr.message);
    }

    // 2. VÁLASZ ÖSSZEÁLLÍTÁSA
    res.json({
      success: true,
      tracker: {
        _id: tracker._id.toString(), // Stringgé alakítjuk a frontendnek
        name: tracker.name,
        icon: tracker.icon,
        uniqueCode: tracker.uniqueCode,
        permissions: tracker.permissions
      },
      owner: {
        name: tracker.permissions?.showName ? owner?.name : 'Tulajdonos',
        bio: owner?.bio || 'Kérlek segíts hazajutni!',
      }
    });
  } catch (err) {
    console.error("🔥 getPublicTracker hiba:", err);
    res.status(500).json({ success: false });
  }
};