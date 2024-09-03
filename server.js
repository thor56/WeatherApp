require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
const openWeatherMapApiKey = process.env.OPENWEATHERMAP_API_KEY;

app.get('/api/keys', (req, res) => {
  res.json({
    googleMapsApiKey: googleMapsApiKey,
    openWeatherMapApiKey: openWeatherMapApiKey,
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});