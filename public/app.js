let googleMapsApiKey;
let openWeatherMapApiKey;

fetch('/api/keys')
  .then(response => response.json())
  .then(data => {
    googleMapsApiKey = data.googleMapsApiKey;
    openWeatherMapApiKey = data.openWeatherMapApiKey;
    initGoogleMaps();
  });

const API_URL = 'https://api.openweathermap.org/data/2.5/';

// Function to get the current weather data
async function getCurrentWeather(city) {
  try {
    const response = await fetch(`${API_URL}weather?q=${city}&units=metric&appid=${openWeatherMapApiKey}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting current weather data:', error);
    return null;
  }
}

// Function to get the 5-day forecast data
async function getForecast(city) {
  try {
    const response = await fetch(`${API_URL}forecast?q=${city}&units=metric&appid=${openWeatherMapApiKey}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting forecast data:', error);
    return null;
  }
}

// Function to update the UI with the current weather data
function updateCurrentWeatherUI(data) {
  if (data && data.main) {
    const cityElement = document.getElementById('city');
    const temperatureElement = document.getElementById('temperature');
    const conditionsElement = document.getElementById('conditions');
    const humidityElement = document.getElementById('humidity');
    const windElement = document.getElementById('wind');

    cityElement.textContent = data.name;
    temperatureElement.textContent = `Temperature: ${data.main.temp}°C`;
    conditionsElement.textContent = `Conditions: ${data.weather[0].description}`;
    humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
    windElement.textContent = `Wind: ${data.wind.speed} m/s`;
  } else {
    console.error('Error updating current weather UI: no data');
  }
}

// Function to update the UI with the 5-day forecast data
function updateForecastUI(data) {
  if (data && data.list) {
    const forecastCards = document.querySelectorAll('.forecast-card');

    forecastCards.forEach((card, index) => {
      const dayElement = card.querySelector('h3');
      const highElement = card.querySelector(`#high-${index + 1}`);
      const lowElement = card.querySelector(`#low-${index + 1}`);
      const precipitationElement = card.querySelector(`#precipitation-${index + 1}`);
      const iconElement = card.querySelector('img');

      dayElement.textContent = `Day ${index + 1}`;
      highElement.textContent = `High: ${data.list[index * 8].main.temp_max}°C`;
      lowElement.textContent = `Low: ${data.list[index * 8].main.temp_min}°C`;
      precipitationElement.textContent = `Precipitation: ${data.list[index * 8].rain ? data.list[index * 8].rain['3h'] : 0} mm`;
      iconElement.src = `https://openweathermap.org/img/wn/${data.list[index * 8].weather[0].icon}@2x.png`;
    });
  } else {
    console.error('Error updating forecast UI: no data');
  }
}

// Initialize Google Maps API
function initGoogleMaps() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initAutocomplete`;
  document.head.appendChild(script);

  // Get default data for New York
  getDefaultData('New York');
}

// Function to get default data
async function getDefaultData(city) {
  const currentWeatherData = await getCurrentWeather(city);
  const forecastData = await getForecast(city);

  updateCurrentWeatherUI(currentWeatherData);
  updateForecastUI(forecastData);
}

// Initialize autocomplete
function initAutocomplete() {
  const autocompleteService = new google.maps.places.AutocompleteService();

  document.getElementById('search-input').addEventListener('input', () => {
    const input = document.getElementById('search-input').value;
    autocompleteService.getPlacePredictions({ input }, (predictions) => {
      renderSuggestions(predictions);
    });
  });

  document.getElementById('search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const city = document.getElementById('search-input').value;
      const currentWeatherData = getCurrentWeather(city);
      const forecastData = getForecast(city);

      updateCurrentWeatherUI(currentWeatherData);
      updateForecastUI(forecastData);
      document.getElementById('suggestions').innerHTML = '';
    }
  });
}

// Render suggestions
function renderSuggestions(suggestions) {
  const suggestionsElement = document.getElementById('suggestions');
  suggestionsElement.innerHTML = '';

  if (suggestions.length > 0) {
    const ulElement = document.createElement('ul');
    suggestionsElement.appendChild(ulElement);

    const limitedSuggestions = suggestions.slice(0, 2);

    limitedSuggestions.forEach((suggestion) => {
      const liElement = document.createElement('li');
      liElement.textContent = suggestion.description;
      ulElement.appendChild(liElement);

      liElement.addEventListener('click', async () => {
        const city = suggestion.description;
        const currentWeatherData = await getCurrentWeather(city);
        const forecastData = await getForecast(city);

        updateCurrentWeatherUI(currentWeatherData);
        updateForecastUI(forecastData);
        suggestionsElement.innerHTML = '';
        document.getElementById('search-input').value = city;
      });
    });
  } else {
    suggestionsElement.innerHTML = '';
  }
}

// Add event listener to search button
document.getElementById('search-button').addEventListener('click', async () => {
  const city = document.getElementById('search-input').value;
  const currentWeatherData = await getCurrentWeather(city);
  const forecastData = await getForecast(city);

  updateCurrentWeatherUI(currentWeatherData);
  updateForecastUI(forecastData);
  document.getElementById('suggestions').innerHTML = '';
});