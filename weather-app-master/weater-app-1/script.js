const apiKey = '784309b309418bff1d9696f579f52d33';

// Start with default page
const defaultCityName = 'Dubai';
getWeather(defaultCityName);
    

document.getElementById('searchButton').addEventListener('click', function () {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeather(city);
    } else {
        showError('Моля, въведете име на град.');
    }
});

function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`;

    document.querySelector('#city-name').textContent = city.toString();
    // the problem here is that it displays the city name in the way it was written
    //but it will do for now

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) {
                displayWeather(data);
            } else {
                showError('Градът не е намерен.');
            }
        })
        .catch((error) => {
            showError('Нямаме връзка с API-то.');
        });
}

function displayWeather(data) {
    const temperature = data.main.temp.toFixed(0);
    const description = data.weather[0].description;
    const feelsLike = data.main.feels_like.toFixed(0);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed.toFixed(0);
    const icon = data.weather[0].icon;


    const weatherImage = document.getElementById('img-weather');
    weatherImage.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherImage.alt = description;

    document.querySelector('#weatherResult').style.display = 'flex';

    document.querySelector('#img-description').textContent = description;
    document.querySelector('#city-degrees').textContent = temperature;
    document.querySelector('#feel-temp').textContent = feelsLike;
    document.querySelector('#humidity-value').textContent = humidity;
    document.querySelector('#wind-value').textContent = windSpeed;
}


function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.querySelector('#weatherResult').style.display = 'none';
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoordinates(lat, lon);
        });
    } else {
        showError('Геолокацията не е разрешена.');
    }
}

function getWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=bg`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => displayWeather(data))
        .catch((error) => showError('Нямаме връзка с API-то.'));
}
