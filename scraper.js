import fetch from "node-fetch";

// Obtener places públicos del usuario
export async function getUserPlaces(userId) {
  const url = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

// Obtener gamepasses de un place mediante scraping
export async function getGamepassesFromPlace(placeId) {
  try {
    const url = `https://www.roblox.com/games/api-get-game-passes?gameId=${placeId}&startIndex=0`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.Data) return [];
    return data.Data.map(gp => ({
      id: gp.ID,
      name: gp.Name,
      price: gp.RobuxPrice ?? 0,
      placeId
    }));
  } catch (err) {
    console.warn(`[Scraping] Error en place ${placeId}: ${err.message}`);
    return [];
  }
}
