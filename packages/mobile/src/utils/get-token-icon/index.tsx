import axios from "axios";

export const getTokenIcon = async (coinGeckoId: string) => {
  try {
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${coinGeckoId}`;
    const response = await axios.get(apiUrl);

    const tokenImage = response.data.image?.small;
    return tokenImage;
  } catch (error) {
    console.log("Error fetching token image:", error.message);
    return null;
  }
};
