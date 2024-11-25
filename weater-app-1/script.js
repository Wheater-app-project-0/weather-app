const apiKey = '784309b309418bff1d9696f579f52d33';

const fiveDaysContainer = document.getElementById('fiveDays-info');
const dayContainer = document.getElementById('day-info');

getLocationWeather();

document.getElementById('searchButton').addEventListener('click', function () {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeather(city);
        getWeatherForFiveDays({ city: city });
    } else {
        showError('Моля, въведете име на град.');
    }
});

function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`;

    document.querySelector('#city-name').textContent = city.toString();

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

function getWeatherForFiveDays({ city = null, lat = null, lon = null } = {}) {
    const dates = getDates();
    let promises = [];
    if (city) {
        promises = dates.map((date) => {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&date=${date}&appid=${apiKey}&units=metric&lang=en`;
            return fetch(url).then((response) => response.json());
        });
    } else if (lat && lon) {
        promises = dates.map((date) => {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&date=${date}&appid=${apiKey}&units=metric&lang=en`;
            return fetch(url).then((response) => response.json());
        });
    }

    Promise.all(promises)
        .then((data) => {
            const weekWeatherObj = {};
            data.forEach((response, index) => {
                weekWeatherObj[dates[index]] = response;
            });
            displayWeatherFiveDays(weekWeatherObj);
        })
        .catch((error) => showError('Нямаме връзка с API-то.'));
}

function displayWeather(data) {
    const temperature = data.main.temp.toFixed(0);
    const description = data.weather[0].description;
    const feelsLike = data.main.feels_like.toFixed(0);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed.toFixed(0);
    const icon = data.weather[0].icon;

    const cityImages = {
        софия: 'images/sofia.jpg',
        sofia: 'images/sofia.jpg',
        пловдив: 'images/plovdiv.jpg',
        plovdiv: 'images/plovdiv.jpg',
        варна: 'images/varna.jpg',
        varna: 'images/varna.jpg',
        бургас: 'images/burgas.jpg',
        burgas: 'images/burgas.jpg',
        'стара загора': 'images/stara-zagora.jpg',
        'stara zagora': 'images/stara-zagora.jpg',
        говедарци: 'images/govedarci.jpg',
        govedarci: 'images/govedarci.jpg',
    };

    const cityName = data.name.toLowerCase();

    if (cityName in cityImages) {
        console.log('Градът има специално изображение:', cityName);
        document.body.style.backgroundImage = `url(${cityImages[cityName]})`;
    } else {
        const weatherImages = {
            clear: 'images/background-clear.webp',
            fog: 'images/background-fog.jpg',
            overcast: 'images/background-overcast-clouds.jpg',
            cloud: 'images/background-cloud.jpg',
            rain: 'images/background-rain.webp',
            snow: 'images/background-snowfall.jpg',
            storm: 'images/background-storm.jpg',
            default: 'images/background-default.webp',
        };
        changeBackgroundImage(description, weatherImages);
    }

    const weatherImage = document.getElementById('img-weather');
    weatherImage.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherImage.alt = description;

    document.querySelector('#weatherResult').style.display = 'flex';
    
    document.querySelector('#img-description').textContent = description;
    document.querySelector('#city-degrees').textContent = temperature;

    document.querySelector('#feel-temp').textContent = feelsLike;
    document.querySelector(
        '#humidity-info > #feel-temp > #humidity-value'
    ).textContent = humidity;
    document.querySelector(
        '#winds-info > #wind-temp > #wind-value'
    ).textContent = windSpeed;
}

function displayWeatherFiveDays(data) {
    let count = 0;
    for (const key of Object.keys(data)) {
        count++;
        const response = data[key];
        const currDayEl = document.querySelector(`.five-days > .day${count}`);

        const currDayImgEl = currDayEl.querySelector('.image-icon-content > img');
        
        const currDayTempMinEl = currDayEl.querySelector('.temp-data > .degrees-min');
        const currDayTempMaxEl = currDayEl.querySelector('.temp-data > .degrees-max');
        
        const tempMin = Math.ceil(response.main.temp_min).toFixed(0);
        const tempMax = Math.ceil(response.main.temp_max).toFixed(0);
        const description = response.weather[0].description;
        const iconUrl = getWeatherIcon(description);
        
        console.log(description);
        console.log(currDayEl);
        console.log(tempMin);
        currDayTempMinEl.textContent = tempMin;
        currDayTempMaxEl.textContent = tempMax;
        currDayImgEl.src = iconUrl;
    }
}

function getWeatherIcon(description) {
    const images = {

        clear: 'images/sunny.png',
        snow: 'images/snow.gif',
        storm: 'images/cloudy storm.png',
        cloud: 'images/clouds.gif',
        rain: 'images/rain.gif',
    };
    
    const typeWeather = description.trim().toLowerCase();

    for (let imageName in images) {
        if (typeWeather.includes(imageName)) {
            return images[imageName];
        }
    }

    return null;
}
// hidden five days screen
fiveDaysContainer.style.display = 'none';

// get current day information
const currDayBtn = document.getElementById('day-btn');
currDayBtn.addEventListener('focus', showCurrentDay);

// get five days information
const weekBtn = document.getElementById('week-btn');
weekBtn.addEventListener('focus', showNextFiveDays);

function showCurrentDay() {
    fiveDaysContainer.style.display = 'none';
    dayContainer.style.display = 'flex';
    currDayBtn.classList.add('active');
    weekBtn.classList.remove('active');
}
function showNextFiveDays() {
    dayContainer.style.display = 'none';
    fiveDaysContainer.style.display = 'flex';
    weekBtn.classList.add('active');
    currDayBtn.classList.remove('active');
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
        const selectedImage = matchingImages[0];
        document.body.style.backgroundImage = `url(${images[selectedImage]})`;
    } else {
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
            getWeatherForFiveDays({ lat: lat, lon: lon });
        });
    } else {
        showError('Геолокацията не е разрешена.');
    }
}

function getWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => displayWeather(data))
        .catch((error) => showError('Нямаме връзка с API-то.'));
}

function showCurrentDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    
    const formattedDateTime = now.toLocaleDateString('bg-BG', options);
    
    document.getElementById('currentDateTime').textContent = formattedDateTime;
}
function getWeekDays() {
    const daysOfWeek = [
        'Неделя',
        'Понеделник',
        'Вторник',
        'Сряда',
        'Четвъртък',
        'Петък',
        'Събота',
    ];
    const today = new Date();
    const daysArray = [];

    for (let i = 0; i < 5; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        const dayName = daysOfWeek[nextDay.getDay()];
        daysArray.push(dayName);
    }
    
    return daysArray;
}

function getDates() {
    const today = new Date(); // returns date object of the current date and time
    
    const days = [];
    
    for (let i = 0; i < 5; i++) {
        const nextDay = new Date(today.getTime() + 86400000 * i);
        const year = nextDay.getFullYear();
        const month = nextDay.getMonth() + 1; // getMonth() returns 0-11, so add 1
        const date = nextDay.getDate();
        const formattedDayInfo = `${year}-${month}-${date}`; //YYYY-MM-DD
        days.push(formattedDayInfo);
    }
    
    return days;
}

function updateDayNames() {
    const daysArray = getWeekDays();
    
    document.querySelector('.day1 .day-name').textContent = daysArray[0];
    document.querySelector('.day2 .day-name').textContent = daysArray[1];
    document.querySelector('.day3 .day-name').textContent = daysArray[2];
    document.querySelector('.day4 .day-name').textContent = daysArray[3];
    document.querySelector('.day5 .day-name').textContent = daysArray[4];
}


window.onload = function () {
    updateDayNames();
};

showCurrentDateTime();
setInterval(showCurrentDateTime, 1000);
