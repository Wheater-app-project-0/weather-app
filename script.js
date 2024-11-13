function getWeather() {
    const city = document.getElementById('city-input').value.trim();

    const fakeWeatherData = {
        "София": {
            temp: "15°C",
            description: "Ясно небе",
            icon: "https://openweathermap.org/img/wn/01d.png"
        },
        "Пловдив": {
            temp: "18°C",
            description: "Разкъсана облачност",
            icon: "https://openweathermap.org/img/wn/03d.png"
        },
        "Варна": {
            temp: "12°C",
            description: "Дъжд",
            icon: "https://openweathermap.org/img/wn/09d.png"
        }
    };

    if (fakeWeatherData[city]) {
        const weather = fakeWeatherData[city];
        document.getElementById('city-name').textContent = city;
        document.getElementById('temp').textContent = `Температура: ${weather.temp}`;
        document.getElementById('weather-description').textContent = weather.description;
        document.getElementById('weather-icon').src = weather.icon;
    } else {
        document.getElementById('weather-result').textContent = "Градът не е намерен.";
    }
}
