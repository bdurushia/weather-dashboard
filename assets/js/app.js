const weatherApi = 'https://api.openweathermap.org/data/2.5/weather?q=';
const uvApi = 'https://api.openweathermap.org/data/2.5/onecall?';
const apiKey = '&appid=e640147e850ba07b1d476b32c5705f94';
const formatUnits = '&units=imperial';
const cityArr = [];
let latitude;
let longitude;

let today = moment().format('MM/DD/YYYY');

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

const getFiveDayForecast = function(data) {
    console.log(data['daily']['0']['temp']['day']);
}

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

const fetchUvAndFiveDayData = function(latitude, longitude){
    const lat = 'lat=' + latitude;
    const lon = '&lon=' + longitude;

    fetch(uvApi + lat + lon + '&exclude=hourly' + formatUnits + apiKey)
    .then(response => response.json())
    .then(data => {
        uviValue = data['current']['uvi'];

        useUviData(uviValue);
        getFiveDayForecast(data);

        console.log(uvApi + lat + lon + '&exclude=hourly' + formatUnits + apiKey);
        console.log(data);
    })
    .catch(err => console.log(err))
}

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

const saveCity = function(){
    let cityBtnEl = $('<buttom type="submit">')
        .addClass('saved-cities container-fluid my-2')
        .prop('id', $('.name').text())
        .text($('.name').text());
    $('.searched-container').append(cityBtnEl);
}

$('.button').on('click', function() {
    let cityName = $('#inputValue').val();
    fetchCityData(cityName);
})

$(document).on('click', '.saved-cities', function() {
    let cityName = $(this).attr('id');
    fetchCityData(cityName);
})