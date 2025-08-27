// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("✅ Proxy Roblox Gamepass activo en Render");
});

// Ruta para obtener gamepasses de un usuario
app.get("/gamepasses", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Falta userId en la query (?userId=...)" });

  try {
    // 1️⃣ Obtener las places públicas del usuario
    const gamesResp = await fetch(`https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`);
    const gamesData = await gamesResp.json();

    if (!gamesData.data || gamesData.data.length === 0) {
      return res.json({ result: "success", data: [] });
    }

    let allGamepasses = [];

    // 2️⃣ Iterar cada place
    for (const place of gamesData.data) {
      try {
        // Obtener universeId
        const universeResp = await fetch(`https://apis.roblox.com/universes/v1/places/${place.rootPlace.id}/universe`);
        const universeData = await universeResp.json();
        const universeId = universeData.universeId;

        if (!universeId) continue;

        // Obtener gamepasses de ese universe
        const passesResp = await fetch(`https://apis.roblox.com/game-passes/v1/game-passes?universeId=${universeId}&limit=100`);
        const passesData = await passesResp.json();

        if (passesData.data && passesData.data.length > 0) {
          allGamepasses.push(
            ...passesData.data.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price ?? 0,
              universeId: universeId
            }))
          );
        }
      } catch (err) {
        console.warn(`[GamepassFetch] Error en place ${place.rootPlace.id}: ${err.message}`);
      }
    }

    res.json({ result: "success", data: allGamepasses });
  } catch (err) {
    console.error("[GamepassFetch] Error general:", err.message);
    res.status(500).json({ result: "error", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
