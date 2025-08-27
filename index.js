import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.json({ status: "ok", msg: "Proxy funcionando" });
});

app.get("/gamepasses", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.json({ result: "error", error: "Falta userId" });

  try {
    // 1) Obtener universos/juegos del usuario
    const gamesRes = await fetch(`https://games.roblox.com/v2/users/${userId}/games?limit=50`);
    const games = await gamesRes.json();

    if (!games.data || games.data.length === 0) {
      return res.json({ result: "success", data: [] });
    }

    let passes = [];

    // 2) Para cada juego, buscar gamepasses
    for (const g of games.data) {
      const universeId = g.id; // este "id" es universeId
      const passRes = await fetch(`https://apis.roblox.com/game-passes/v1/game-passes/universe/${universeId}?limit=100`);
      const passJson = await passRes.json();

      if (passJson.data) {
        passes = passes.concat(passJson.data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price ?? 0,
          universeId: universeId
        })));
      }
    }

    res.json({ result: "success", data: passes });
  } catch (err) {
    console.error(err);
    res.json({ result: "error", error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
