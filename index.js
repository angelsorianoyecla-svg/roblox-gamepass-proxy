import express from "express";
import fetch from "node-fetch";

const app = express();

// Ruta principal de prueba
app.get("/", (req, res) => {
  res.send("✅ Proxy Roblox funcionando en Render!");
});

/**
 * Proxy para obtener Gamepasses de un usuario
 * Endpoint: /gamepasses?userId=XXXX
 */
app.get("/gamepasses", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Falta userId" });
  }

  try {
    // Llamamos a la API oficial de Roblox
    const response = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=10`
    );

    if (!response.ok) {
      throw new Error(`Roblox API error: ${response.status}`);
    }

    const data = await response.json();

    // Devolver datos al cliente (Roblox Studio o web)
    res.json({
      result: "success",
      response: data,
    });
  } catch (err) {
    console.error("❌ Error en proxy:", err.message);
    res.status(500).json({
      result: "error",
      error: err.message,
    });
  }
});

/**
 * Proxy genérico (para cualquier URL de Roblox)
 * Endpoint: /proxy?url=https://catalog.roblox.com/v1/search/items?keyword=hat
 */
app.get("/proxy", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Falta parámetro url" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Roblox API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      result: "success",
      response: data,
    });
  } catch (err) {
    console.error("❌ Error en proxy genérico:", err.message);
    res.status(500).json({
      result: "error",
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

