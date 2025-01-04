const { validationResult } = require("express-validator");
const { fireStore } = require("../config/firestore");
const generateRandomId = () => {
    const randomId = `creatorId-${Date.now()}${Math.floor(Math.random() * 10000000000000000)}`;
    return randomId;
};
const preSaveController = async (req, res) => {
    try {
        // Validate request input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { artist,songLink, title, releaseDate, timezone, providers } = req.body;

        // Query the "presaves" collection to check for its existence
        const presavesSnapshot = await fireStore.collection("presaves").limit(1).get();

        // If the collection does not exist, presavesSnapshot.empty will be true
        if (presavesSnapshot.empty) {
            console.log("No 'presaves' collection found. Creating a new one...");
        }

        // Create a new presave document
        const newPresaveData = {
            creatorId: generateRandomId(),
            title,
            artist,
            releaseDate,
            timezone,
            providers,
            songLink, 
            createdAt: new Date().toISOString(), // Add a timestamp for tracking
        };

        const newPresaveRef = await fireStore.collection("presaves").add(newPresaveData);

        res.status(201).json({
            message: "Presave created successfully",
            id: newPresaveRef.id,
            ...newPresaveData,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Controller to handle fetching presaves by id or creatorId
const getPresaveController = async (req, res) => {
    try {
        const { id, creatorId } = req.query;

        if (!id && !creatorId) {
            return res.status(400).json({ error: "Either 'id' or 'creatorId' is required to fetch a presave." });
        }

        let querySnapshot;
        if (id) {
            // Fetch presave by ID
            querySnapshot = await fireStore.collection("presaves").doc(id).get();
        } else if (creatorId) {
            // Fetch presave by creatorId
            querySnapshot = await fireStore.collection("presaves")
                .where("creatorId", "==", creatorId)
                .limit(1)
                .get();
        }

        if (!querySnapshot.exists && querySnapshot.empty) {
            return res.status(404).json({ error: "Presave not found." });
        }

        const presaveData = querySnapshot.data ? querySnapshot.data() : querySnapshot.docs[0].data();

        res.status(200).json({
            message: "Presave retrieved successfully",
            presave: presaveData,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { preSaveController, getPresaveController };