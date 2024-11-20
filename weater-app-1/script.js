const apiKey = '784309b309418bff1d9696f579f52d33';

getLocationWeather();
    

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


    const images = {
        "clear": "../images/background-clear.webp",
        "fog": "../images/background-fog.jpg",
        "clouds": "../images/background-overcast-clouds.jpg",
        "cloud": "../images/background-cloud.jpg",
        "rain": "../images/background-rain.webp",
        "snow": "../images/background-snowfall.jpg",
        "storm": "../images/background-storm.jpg",
        "default": "../images/background-default.webp",
      };
      changeBackgroundImage(description, images);


    const weatherImage = document.getElementById('img-weather');
    weatherImage.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherImage.alt = description;

    document.querySelector('#weatherResult').style.display = 'flex';

    document.querySelector('#img-description').textContent =
        description;

    document.querySelector('#city-degrees').textContent =
        temperature;

    document.querySelector('#feel-temp').textContent = feelsLike;
    document.querySelector(
        '#humidity-info > #feel-temp > #humidity-value'
    ).textContent = humidity;
    document.querySelector(
        '#winds-info > #wind-temp > #wind-value'
    ).textContent = windSpeed;
}

function changeBackgroundImage(description, images) {
    const typeWeather = description.trim().toLowerCase();
    const matchingImages = [];


    for (let imageName in images) {
        if (typeWeather.includes(imageName)) {
            matchingImages.push(imageName);
        }
    }

    if (matchingImages.length > 0) {
        // If there are matches, set the background to the first match
        const selectedImage = matchingImages[0];
        document.body.style.backgroundImage = `url(${images[selectedImage]})`;
    } else {
        // If no matches, show an default image
        document.body.style.backgroundImage = `url(${images['default']})`;
    }
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
