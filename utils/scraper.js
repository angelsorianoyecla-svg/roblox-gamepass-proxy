import puppeteer from "puppeteer";

// Obtener los places públicos de un usuario
export async function getUserPlaces(userId) {
  const url = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

// Extraer gamepasses de un place usando Puppeteer
export async function getGamepassesFromPlace(placeId) {
  const gameUrl = `https://www.roblox.com/games/${placeId}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(gameUrl, { waitUntil: "networkidle2" });
    // Esperar a que cargue el contenedor de gamepasses
    await page.waitForSelector(".game-pass-card", { timeout: 5000 });

    // Extraer los datos de cada gamepass
    const passes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".game-pass-card")).map(card => ({
        id: parseInt(card.getAttribute("data-id")),
        name: card.querySelector(".game-pass-name")?.textContent || "Sin nombre",
        price: parseInt(card.querySelector(".price")?.textContent.replace("R$", "").trim()) || 0
      }));
    });

    await browser.close();
    return passes;
  } catch (err) {
    console.warn(`[Scraping] Error en place ${placeId}: ${err.message}`);
    await browser.close();
    return [];
  }
}
