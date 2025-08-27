import express from "express";
import { getUserPlaces, getGamepassesFromPlace } from "./utils/scraper.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/gamepasses", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Falta userId" });

  try {
    const places = await getUserPlaces(userId);
    let allGamepasses = [];

    for (const place of places) {
      const placeId = place.rootPlace?.id;
      if (!placeId) continue;

      console.log(`Scraping placeId: ${placeId} (${place.name})`);
      const passes = await getGamepassesFromPlace(placeId);
      allGamepasses.push(...passes);
    }

    res.json({ result: "success", data: allGamepasses });
  } catch (err) {
    console.error("[Scraping] Error general:", err.message);
    res.status(500).json({ result: "error", error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Proxy corriendo en puerto ${PORT}`));
