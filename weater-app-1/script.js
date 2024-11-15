const apiKey = '784309b309418bff1d9696f579f52d33';

document.getElementById('searchButton').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeather(city);
    } else {
        showError('Моля, въведете име на град.');
    }
});

function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=bg`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                displayWeather(data);
            } else {
                showError('Градът не е намерен.');
            }
        })
        .catch(error => {
            showError('Нямаме връзка с API-то.');
        });
}

function displayWeather(data) {
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    const weatherHTML = `
        <h2>${data.name}</h2>
        <img src="${icon}" alt="${description}">
        <p>Температура: ${temperature}°C</p>
        <p>Описание: ${description}</p>
        <p>Влажност: ${humidity}%</p>
        <p>Скорост на вятъра: ${windSpeed} м/с</p>
    `;
    
    document.getElementById('weatherResult').innerHTML = weatherHTML;
    document.getElementById('errorMessage').innerHTML = '';
}

function showError(message) {
    document.getElementById('errorMessage').innerHTML = message;
    document.getElementById('weatherResult').innerHTML = '';
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
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
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => showError('Нямаме връзка с API-то.'));
}
