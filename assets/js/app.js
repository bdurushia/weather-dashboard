const weatherApi = 'https://api.openweathermap.org/data/2.5/weather?q=';
const uvApi = 'https://api.openweathermap.org/data/2.5/onecall?';
const apiKey = '&appid=e640147e850ba07b1d476b32c5705f94';
const formatUnits = '&units=imperial';
let cityArr = [];
let latitude;
let longitude;

// set todays date
let today = moment().format('MM/DD/YYYY');

// Create Five Day Forecast cards
const createCard = function(dateValue, tempValue, windValue, humidityValue, iconValue){

    let card = $('<div>').addClass('card mx-3 container-fluid')
    let cardBody = $('<div>').addClass('card-body');

    let headerEl = $('<h5>')
        .addClass('forecast-date card-title')
        .text(dateValue);

    let iconDiv = $('<div>')
        .prop('id', 'wiconDiv');

    let iconURL = "http://openweathermap.org/img/w/" + iconValue + ".png";

    let imgIconEl = $('<img>')
        .prop('id', 'wicon')
        .attr('src', iconURL)
        .attr('alt', 'Weather Icon')
        .attr('style', 'display: inline');

    let tempEl = $('<p>')
        .addClass('card-text card-temp')
        .text('Temp: ' + tempValue + '°F');

    let windEl = $('<p>')
        .addClass('card-text card-wind')
        .text('Wind: ' + windValue + ' mph');

    let humidityEl = $('<p>')
        .addClass('card-text card-humidity')
        .text('Humidity: ' + humidityValue + '%');

    $('.five-day-container')
        .append(card
            .append(cardBody
                .append(headerEl, 
                    iconDiv
                        .append(imgIconEl), 
                    tempEl, 
                    windEl, 
                    humidityEl)));
}

// Get current weather data
const getWeather = function(data) {
    let nameValue = data['name'];
    let tempValue = data['main']['temp'];
    let windValue = data['wind']['speed'];
    let humidityValue = data['main']['humidity'];
    let uviValue;

    let iconValue = data['weather']['0']['icon'];
    let iconURL = "http://openweathermap.org/img/w/" + iconValue + ".png";

    $('#wicon').attr('style', 'display: inline').attr('src', iconURL);
    $('.name').html(nameValue);
    $('.current-date').html(today);
    $('.temp').html('Temp: ' + tempValue + '°F');
    $('.wind').html('Wind: ' + windValue + ' mph');
    $('.humidity').html('Humidity: ' + humidityValue + '%');

    latitude = data['coord']['lat'];
    longitude = data['coord']['lon'];

    fetchUvAndFiveDayData(latitude, longitude, uviValue);
}

// get five day forecast weather, assign values to weather cards
const getFiveDayForecast = function(data) {
    for (let i = 0; i < 5; i++) {
        let dateValue = moment().add((1 + i), 'd').format('MM/DD/YYYY');
        let tempValue = data['daily'][i]['temp']['day'];
        let windValue = data['daily'][i]['wind_speed'];
        let humidityValue = data['daily'][i]['humidity'];

        let iconValue = data['daily'][i]['weather']['0']['icon'];
        
        createCard(dateValue, tempValue, windValue, humidityValue, iconValue);
    }
}

// Use UVI data value and change div color based on how high or low the value is
const useUviData = function(uviValue) {
    $('.uv-index').html('UV Index: ');
    let uvSpanEl = $('<span>').prop('id', 'uvi').addClass('uv uv-none').text(uviValue);
    $('.uv-index').append(uvSpanEl);

    if (uviValue < 3) {
        $('#uvi').removeAttr('class').addClass('uv uv-low');
    } else if (3 <= uviValue && uviValue < 6) {
        $('#uvi').removeAttr('class').addClass('uv uv-moderate');
    } else if (6 <= uviValue && uviValue < 8) {
        $('#uvi').removeAttr('class').addClass('uv uv-high');
    } else if (8 <= uviValue && uviValue < 11) {
        $('#uvi').removeAttr('class').addClass('uv uv-very-high');
    } else if (uviValue >= 11) {
        $('#uvi').removeAttr('class').addClass('uv uv-extreme');
    }
}

// fetch fiveday forecast data by city coordinates retrieved from fetchCityData, passing in lat and lon
const fetchUvAndFiveDayData = function(latitude, longitude){
    const lat = 'lat=' + latitude;
    const lon = '&lon=' + longitude;

    fetch(uvApi + lat + lon + '&exclude=hourly' + formatUnits + apiKey)
    .then(response => response.json())
    .then(data => {
        uviValue = data['current']['uvi'];

        useUviData(uviValue);
        getFiveDayForecast(data);
    })
    .catch(err => console.log(err))
}

// fetch current weather data by city name
const fetchCityData = function(cityName){
    fetch(weatherApi + cityName + formatUnits + apiKey)
    .then(response => response.json())
    .then(data => {
        getWeather(data);

        // check if city has been saved to previous searches
        cityName = data['name'];
        let cityNameLower = cityName.toLowerCase();
        if(cityArr[0] === undefined){
            cityArr.push(cityNameLower);
            saveCity();
        } else if (cityArr.includes(cityNameLower)) {
            console.log('second if', cityArr);
        } else {
            cityArr.push(cityNameLower);
            saveCity();
        }
    })
    .catch(err => console.log(err))
}

// save searched cities to local storage
const saveLocalStorage = function(){
    localStorage.setItem("cities", JSON.stringify(cityArr));
}

// get saved cities from local storay and display to page
const getLocalStorage = function(){
    cityArr = JSON.parse(localStorage.getItem("cities"));

    if (!cityArr) {
        cityArr = [];
    }
    
    $.each(cityArr, function(i) {
        let name = cityArr[i];
        let cityBtnEl = $('<buttom type="submit">')
            .addClass('saved-cities container-fluid my-2')
            .prop('id', name)
            .text(name);
        $('.searched-container').append(cityBtnEl);
    })
}

// save cities searched to clickable buttons on page
const saveCity = function(){
    saveLocalStorage(cityArr);
    let cityBtnEl = $('<buttom type="submit">')
        .addClass('saved-cities container-fluid my-2')
        .prop('id', $('.name').text())
        .text($('.name').text());
    $('.searched-container').append(cityBtnEl);
}

// display containers when a fetch button is first clicked, pageload hides containers
const displayContainers = function() {
    $('.display').attr('style', 'display: block');
    $('.forecast').attr('style', 'display: block');
}

getLocalStorage();

// search (input) button
$('.button').on('click', function() {
    $('.five-day-container').empty();
    let cityName = $('#inputValue').val();
    fetchCityData(cityName);
    displayContainers();
})

// Saved cities buttons
$(document).on('click', '.saved-cities', function() {
    $('.five-day-container').empty();
    let cityName = $(this).attr('id');
    fetchCityData(cityName);
    displayContainers();
})