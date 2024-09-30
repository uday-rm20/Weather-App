let cityInput = document.getElementById('city_input');
let searchBtn = document.getElementById('searchbtn');
locationBtn = document.getElementById('locationbtn');
const api_key = '2c2a9bf7cfea4189bd5f2c6fee10f43b'; /* API key from openweathermap.org */
let recentCitiesDropdown = document.getElementById('recentCitiesDropdown');

/*Function to add city to recent searches*/
function addRecentCity(cityName) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    /*Check if city is already in the recent list*/
    if (!recentCities.includes(cityName)) {
        recentCities.push(cityName);
        /*Save updated cities in localStorage*/
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }

    updateDropdown(recentCities);
}

/*Function to update the dropdown with recent cities*/
function updateDropdown(cities) {
    /*Show the dropdown if there are any recent cities*/
    if (cities.length > 0) {
        recentCitiesDropdown.style.display = 'block';
        recentCitiesDropdown.innerHTML = '<option value="">Select a recently searched city</option>';

        cities.forEach(city => {
            let option = document.createElement('option');
            option.value = city;
            option.text = city;
            recentCitiesDropdown.appendChild(option);
        });
    } else {
        recentCitiesDropdown.style.display = 'none'; /*Hide the dropdown menu  if no cities are searched*/
    }
}


/* Declare currentweatherCard and fiveDaysForecastCard*/
let currentweatherCard = document.querySelectorAll('.weather-left .card')[0],
    fiveDaysForecastCard = document.querySelectorAll('.day-forecast')[0], 
    aqiCard = document.querySelectorAll('.highlights .card')[0],
    sunriseCard = document.querySelectorAll('.highlights .card')[1],
    humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windspeedVal = document.getElementById('windspeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    hourlyForecastCard = document.querySelector('.hourly-forecast'),
    aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

function getWeatherDetails(name, lat, lon, country) { 
    addRecentCity(name);
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,/* URL from openweathermap.org for fetching weather and pollution details */
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
        AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
        days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
        ],
        months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ];

    /*Fetching air pollution data*/
    fetch(AIR_POLLUTION_API_URL).then(res => res.json()).then(data => {
        if (data.list && data.list[0].main) {
            let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
            aqiCard.innerHTML = `
                <div class="card-head">
                    <p>Air Quality Index</p>
                    <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
                </div>
                <div class="air-indices">
                    <i class="fa-regular fa-wind fa-3x"></i>
                    <div class="item">
                        <p>PM2.5</p>
                        <h2>${pm2_5}</h2>
                    </div>
                    <div class="item">
                        <p>PM10</p>
                        <h2>${pm10}</h2>
                    </div>
                    <div class="item">
                        <p>SO2</p>
                        <h2>${so2}</h2>
                    </div>
                    <div class="item">
                        <p>CO</p>
                        <h2>${co}</h2>
                    </div>
                    <div class="item">
                        <p>NO</p>
                        <h2>${no}</h2>
                    </div>
                    <div class="item">
                        <p>NO2</p>
                        <h2>${no2}</h2>
                    </div>
                    <div class="item">
                        <p>NH3</p>
                        <h2>${nh3}</h2>
                    </div>
                    <div class="item">
                        <p>O3</p>
                        <h2>${o3}</h2>
                    </div>
                </div>
            `;
        } else {
            alert('Air Quality Index data is not available.');
        }
    }).catch(() => {
        alert('Failed to fetch Air Quality Index'); /* Catch keyword is used for Error handling in case of problem while fetching data */
    });

    /*Fetching current weather*/
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        let date = new Date();
        currentweatherCard.innerHTML = `
            <div class="current-weather">
                <div class="details">
                    <p>Now</p>
                    <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                    <p>${data.weather[0].description}</p>
                </div>
                <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                </div>
            </div>
            <hr>
            <div class="card-footer">
                <p><i class="fas fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</p>
                <p><i class="fas fa-location-dot"></i> ${name}, ${country}</p>
            </div>
        `;
        
        let { sunrise, sunset } = data.sys,
            { timezone, visibility } = data,
            { humidity, pressure, feels_like } = data.main,
            { speed } = data.wind,
            sRiseTime = moment.utc(sunrise, 'x').add(timezone, 'seconds').format('hh:mm A'),
            sSetTime = moment.utc(sunset, 'x').add(timezone, 'seconds').format('hh:mm A');

        sunriseCard.innerHTML = `
            <div class="card-head">
                <p>Sunrise & Sunset</p>
            </div>
            <div class="sunrise-sunset">
                <div class="item">
                    <div class="icon">
                        <i class="fa-light fa-sunrise fa-4x"></i>
                    </div>
                    <div>
                        <p>Sunrise</p>
                        <h2>${sRiseTime}</h2>
                    </div>
                </div>
                <div class="item">
                    <div class="icon">
                        <i class="fa-light fa-sunset fa-4x"></i>
                    </div>
                    <div>
                        <p>Sunset</p>
                        <h2>${sSetTime}</h2>
                    </div>
                </div>
            </div>
        `;
        
        humidityVal.innerHTML = `${humidity}%`;
        pressureVal.innerHTML = `${pressure}hPa`;
        visibilityVal.innerHTML = `${(visibility / 1000).toFixed(1)}km`;
        windspeedVal.innerHTML = `${speed}m/s`;
        feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(2)}&deg;C`;
    }).catch(() => {
        alert('Failed to fetch current weather');/* Catch keyword is used for Error handling in case of problem while fetching data */
    });

    /*Fetching  5-day weather forecast*/
    fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
        let hourlyForecast = data.list;
        hourlyForecastCard.innerHTML = '';
        
        /* fetching hourly forecast of the present day */
        for (let i = 0; i < Math.min(7, hourlyForecast.length); i++) {
            let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
            let hr = hrForecastDate.getHours();
            let a = 'PM';
            if (hr < 12) a = 'AM';
            if (hr == 0) hr = 12;
            if (hr > 12) hr = hr - 12;

            hourlyForecastCard.innerHTML += `
                <div class="card">
                    <p>${hr} ${a}</p>
                    <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png">
                    <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
                </div>
            `;
        }

        let uniqueForecastDays = [];
        let fiveDaysForecast = data.list.filter(forecast => {
            let forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true; 
            }
            return false; 
        });

        /*Clear the previous forecast*/
        fiveDaysForecastCard.innerHTML = '';
        
        /*Loop through the forecast data*/
        for (let i = 0; i < fiveDaysForecast.length; i++) {
            let date = new Date(fiveDaysForecast[i].dt_txt);
            fiveDaysForecastCard.innerHTML += `
                <div class="forecast-item">
                    <div class="icon-wrapper">
                        <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                        <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                    </div>
                    <p>${date.getDate()} ${months[date.getMonth()]}</p>
                    <p>${days[date.getDay()]}</p>
                </div>
            `;
        }
    }).catch(() => {
        alert('Failed to fetch 5-day forecast');/* Catch keyword is used for Error handling in case of problem while fetching data */
    });
}

function getUserCoordinates(){
    navigator.geolocation.getCurrentPosition(position => {
        let {latitude, longitude} = position.coords;
        let REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

        fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
            let {name, country, state} = data[0];
            getWeatherDetails(name, latitude, longitude, country, state);
        }).catch(() => {
            alert('Failed to fetch user coordinates');/* Catch keyword is used for Error handling in case of problem while fetching data */
        });
    }, error => {
        if(error.code === error.PERMISSION_DENIED){
            alert('Geolocation permission denied. Please reset location permission to grant access again');/* Catch keyword is used for Error handling in case of problem while fetching data */
        }
    });
}

/* using Eventlistener for both search and current location button */
searchBtn.addEventListener('click', () => {
    let cityName = cityInput.value;
    let API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${api_key}`;
    
    fetch(API_URL).then(res => res.json()).then(data => {
        if (data.cod !== 200) {
            alert(data.message);
            return;
        }

        let { name, coord, sys } = data;
        getWeatherDetails(name, coord.lat, coord.lon, sys.country);
    }).catch(() => {
        alert('Failed to fetch the city weather data');/* Catch keyword is used for Error handling in case of problem while fetching data */
    });
});


/* using Eventlistener for both search and current location button */
recentCitiesDropdown.addEventListener('change', function() {
    let cityName = recentCitiesDropdown.value;
    
    if (cityName) {
        let API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${api_key}`;
        
        fetch(API_URL).then(res => res.json()).then(data => {
            if (data.cod !== 200) {
                alert(data.message);
                return;
            }

            let { name, coord, sys } = data;
            getWeatherDetails(name, coord.lat, coord.lon, sys.country);
        }).catch(() => {
            alert('Failed to fetch the city weather data');/* Catch keyword is used for Error handling in case of problem while fetching data */
        });
    }
});


/* using Eventlistener for both search and current location button */
locationBtn.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates);

