const apiKey = import.meta.env.VITE_API_KEY;

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

    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) {
                displayWeather(data);
            } else {
                showError('Градът не е намерен.');
            }
            return data;
        })
        .catch((error) => {
            showError('Нямаме връзка с API-то.');
        });
}

function getWeatherForFiveDays({ city = null, lat = null, lon = null } = {}) {
    let url = '';

    if (city) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=en`;
    } else if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`;
    } else {
        return;
    }

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const todayStr = new Date().toISOString().split('T')[0];

            const filteredList = data.list.filter(item => {
                const [date] = item.dt_txt.split(' ');
                return date !== todayStr;
            });
            const dailyForecast = extractDailyForecast(filteredList);
            displayWeatherFiveDays(dailyForecast);
        })
        .catch((error) => showError('Нямаме връзка с API-то.'));
}


function extractDailyForecast(forecastList) {
    const groupedByDate = {};

    forecastList.forEach(item => {
        const [date, time] = item.dt_txt.split(' ');

        if (!groupedByDate[date]) {
            groupedByDate[date] = {
                temps: [],
                weatherIcons: [],
                allItems: [],
                earliest: item,
                latest: item
            };
        }

        groupedByDate[date].temps.push(item.main.temp);
        groupedByDate[date].weatherIcons.push(item.weather[0]);
        groupedByDate[date].allItems.push(item);

        if (item.dt_txt < groupedByDate[date].earliest.dt_txt) {
            groupedByDate[date].earliest = item;
        }

        if (item.dt_txt > groupedByDate[date].latest.dt_txt) {
            groupedByDate[date].latest = item;
        }

        if (time === '06:00:00') {
            groupedByDate[date].minTemp = item.main.temp;
            groupedByDate[date].weatherMin = item.weather[0];
        }

        if (time === '15:00:00') {
            groupedByDate[date].maxTemp = item.main.temp;
            groupedByDate[date].weatherMax = item.weather[0];
        }
    });

    const result = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const sortedDates = Object.keys(groupedByDate).sort();

    for (let date of sortedDates) {
        if (date === todayStr) continue;

        const dayData = groupedByDate[date];
        if (dayData.minTemp === undefined) {
            const earlyMorning = dayData.allItems.find(i => i.dt_txt.includes('03:00:00') || i.dt_txt.includes('09:00:00'));
            if (earlyMorning) {
                dayData.minTemp = earlyMorning.main.temp;
                dayData.weatherMin = earlyMorning.weather[0];
            }
        }
        if (dayData.maxTemp === undefined) {
            const afternoon = dayData.allItems.find(i => i.dt_txt.includes('12:00:00') || i.dt_txt.includes('18:00:00'));
            if (afternoon) {
                dayData.maxTemp = afternoon.main.temp;
                dayData.weatherMax = afternoon.weather[0];
            }
        }


        const minTemp = dayData.minTemp !== undefined
            ? dayData.minTemp
            : Math.min(...dayData.temps);
        const maxTemp = dayData.maxTemp !== undefined
            ? dayData.maxTemp
            : Math.max(...dayData.temps);

        const description =
            dayData.weatherMax?.description ||
            dayData.latest.weather[0].description ||
            dayData.weatherMin?.description ||
            'clear';
        const icon =
            dayData.weatherMax?.icon ||
            dayData.latest.weather[0].icon ||
            dayData.weatherMin?.icon ||
            '01d';

        result.push({
            date,
            temp_min: minTemp,
            temp_max: maxTemp,
            description: description,
            icon: icon,
        });

        if (result.length === 5) break;
    }

    return result;
}


function displayWeather(data) {
    const temperature = data.main.temp.toFixed(0);
    const description = data.weather[0].description;
    const feelsLike = data.main.feels_like.toFixed(0);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed.toFixed(0);
    const icon = data.weather[0].icon;

    const cityImages = {
        софия: 'public/images/sofia.jpg',
        sofia: 'public/images/sofia.jpg',
        пловдив: 'public/images/plovdiv.jpg',
        plovdiv: 'public/images/plovdiv.jpg',
        варна: 'public/images/varna.jpg',
        varna: 'public/images/varna.jpg',
        бургас: 'public/images/burgas.jpg',
        burgas: 'public/images/burgas.jpg',
        'стара загора': 'public/images/stara-zagora.jpg',
        'stara zagora': 'public/images/stara-zagora.jpg',
        говедарци: 'public/images/govedarci.jpg',
        govedarci: 'public/images/govedarci.jpg',
    };

    const cityName = data.name.toLowerCase();

    if (cityName in cityImages) {
        console.log('Градът има специално изображение:', cityName);
        document.body.style.backgroundImage = `url(${cityImages[cityName]})`;
        document.body.style.backgroundAttachment = 'fixed';
    } else {
        const weatherImages = {
            clear: 'public/images/background-clear.webp',
            fog: 'public/images/background-fog.jpg',
            overcast: 'public/images/background-overcast-clouds.jpg',
            cloud: 'public/images/background-cloud.jpg',
            rain: 'public/images/background-rain.webp',
            snow: 'public/images/background-snowfall.jpg',
            storm: 'public/images/background-storm.jpg',
            default: 'public/images/background-default.webp',
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


function displayWeatherFiveDays(forecasts) {
    forecasts.forEach((forecast, index) => {
        const currDayEl = document.querySelector(`.five-days > .day${index + 1}`);
        const currDayImgEl = currDayEl.querySelector('.image-icon-content > img');
        const currDayTempMinEl = currDayEl.querySelector('.temp-data > .degrees-min');
        const currDayTempMaxEl = currDayEl.querySelector('.temp-data > .degrees-max');

        const tempMin = Math.round(forecast.temp_min);
        const tempMax = Math.round(forecast.temp_max);
        const description = forecast.description;
        // const iconUrl = getWeatherIcon(description);
        const iconCode = forecast.icon;
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

        currDayTempMinEl.textContent = tempMin;
        currDayTempMaxEl.textContent = tempMax;

        if (iconUrl) {
            currDayImgEl.src = iconUrl;
            currDayImgEl.alt = description;
        }
    });
}

function getWeatherIcon(description) {
    const images = {
        clear: 'public/images/sunny.png',
        snow: 'public/images/snow.gif',
        storm: 'public/images/cloudy storm.png',
        cloud: 'public/images/clouds.gif',
        rain: 'public/images/rain.gif',
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
        document.body.style.backgroundAttachment = 'fixed';
    } else {
        document.body.style.backgroundImage = `url(${images['default']})`;
        document.body.style.backgroundAttachment = 'fixed';
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
        .catch((error) => showError('Connection lost!'));
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

    for (let i = 1; i <= 5; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        const dayName = daysOfWeek[nextDay.getDay()];
        daysArray.push(dayName);
    }
    
    return daysArray;
}

function getDates() {
    const today = new Date();
    
    const days = [];
    
    for (let i = 1; i <= 5; i++) {
        const nextDay = new Date(today.getTime() + 86400000 * i);
        const year = nextDay.getFullYear();
        const month = nextDay.getMonth() + 1;
        const date = nextDay.getDate();
        const formattedDayInfo = `${year}-${month}-${date}`;
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

