import puppeteer from "puppeteer-core";
import { execSync } from "child_process";

// Función para obtener la ruta del Chromium instalado en Render
function getChromiumPath() {
  try {
    const path = execSync("which chromium-browser || which chromium").toString().trim();
    return path;
  } catch {
    throw new Error("Chromium no encontrado en el sistema");
  }
}

// Obtener places públicos
export async function getUserPlaces(userId) {
  const url = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

// Scraping de gamepasses con puppeteer-core
export async function getGamepassesFromPlace(placeId) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: getChromiumPath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  const gameUrl = `https://www.roblox.com/games/${placeId}`;

  try {
    await page.goto(gameUrl, { waitUntil: "networkidle2" });

    // Esperar a que aparezca algún contenedor de gamepasses
    await page.waitForSelector(".game-pass-card", { timeout: 5000 });

    const passes = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".game-pass-card")).map(card => ({
        id: parseInt(card.getAttribute("data-id")),
        name: card.querySelector(".game-pass-name")?.textContent || "Sin nombre",
        price: parseInt(card.querySelector(".price")?.textContent.replace("R$", "").trim()) || 0
      }))
    );

    await browser.close();
    return passes;
  } catch (err) {
    console.warn(`[Scraping] Error en place ${placeId}: ${err.message}`);
    await browser.close();
    return [];
  }
}
