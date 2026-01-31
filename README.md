<div align="center">

# ⚠️ Deprecated Repository  
This repository is **deprecated** and is no longer maintained.

</div>

# 🎧 Spotify Access Token Provider

This repository automatically provides refreshed **free Spotify access token**.  
You can use this token to interact with Spotify's public APIs **without needing your own Client ID or Secret**, and **without any special rate limits** for typical usage.

---

## 📌 Access Token URL

The latest Spotify access token is always available at:

[https://raw.githubusercontent.com/itzzzme/spotify-key/refs/heads/main/token.json](https://raw.githubusercontent.com/itzzzme/spotify-key/refs/heads/main/token.json)

You can fetch this token in your applications and use it directly with Spotify's API.

---

## 🛠 Usage Examples

### ✅ Axios (Node.js)

```javascript
import axios from 'axios';

(async () => {
  try {
    // Fetch token list JSON
    const { data } = await axios.get(
      'https://raw.githubusercontent.com/itzzzme/spotify-key/refs/heads/main/token.json'
    );

    // Pick the first token from the tokens array
    const accessToken = data.tokens?.[0]?.access_token;

    if (!accessToken) {
      throw new Error('No access token found');
    }

    // Call Spotify API with the token
    const response = await axios.get('https://api.spotify.com/v1/albums/4aawyAB9vmqN3uQ7FjRGTy', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log(response.data);
  } catch (err) {
    console.error('Error:', err.message || err);
  }
})();

```

## ⚠️ Disclaimer

- This project is intended for **educational and personal use**.
- This project is **not affiliated with Spotify** in any way.

---

> ### Support
>
> If you like the project feel free to drop a star ✨. Your appreciation means a lot.

<p align="center" style="text-decoration: none;">Made by <a href="https://github.com/itzzzme" tarGET="_blank">itzzzme 
</a>🫰</p>
