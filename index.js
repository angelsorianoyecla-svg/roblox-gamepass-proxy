// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Ruta raíz para comprobar que funciona
app.get("/", (req, res) => {
  res.send("✅ Proxy Roblox Gamepass activo en Render");
});

// Ruta para obtener gamepasses de un usuario
app.get("/gamepasses", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Falta userId en la query (?userId=...)" });

  try {
    // 1️⃣ Obtener todos los universes (juegos) del usuario
    const gamesRes = await fetch(`https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`);
    const gamesData = await gamesRes.json();

    if (!gamesData.data || gamesData.data.length === 0) {
      return res.json({ result: "success", data: [] });
    }

    let allGamepasses = [];

    // 2️⃣ Iterar cada universo para sacar gamepasses
    for (const game of gamesData.data) {
      const universeId = game.id;

      try {
        const passesRes = await fetch(
          `https://apis.roblox.com/game-passes/v1/game-passes?universeId=${universeId}&limit=100`
        );
        const passesData = await passesRes.json();

        if (passesData.data && passesData.data.length > 0) {
          allGamepasses.push(...passesData.data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price ?? 0,
            universeId: universeId
          })));
        }
      } catch (err) {
        console.warn(`[GamepassFetch] Error fetch universe ${universeId}:`, err.message);
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
