// Ideiglenes teszt útvonal: GET /api/trackers/test-inject
router.get('/test-inject', protect, async (req, res) => {
    try {
        // 1. Keressünk egyet a trackereid közül
        const tracker = await Tracker.findOne({ owner: req.user._id });
        
        if (!tracker) {
            return res.status(400).json({ error: "Nincs trackered, adj hozzá egyet előbb!" });
        }

        // 2. Manuális log létrehozása Budapest közepére
        const testLog = new Log({
            trackerId: tracker._id,
            ownerId: req.user._id,
            type: 'SCAN',
            deviceInfo: "Manuális Teszt (Mac)",
            location: {
                type: 'Point',
                coordinates: [19.0402, 47.4979] // Budapest LNG, LAT
            },
            date: new Date()
        });

        await testLog.save();
        res.json({ success: true, message: "Teszt log befecskendezve!", trackerName: tracker.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
