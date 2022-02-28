const weatherApi = 'https://api.openweathermap.org/data/2.5/weather?q=';
const apiKey = '&appid=e640147e850ba07b1d476b32c5705f94';
const formatUnits = '&units=imperial';
const cityArr = [];

const getWeather = function(data) {
    let nameValue = data['name'];
    let tempValue = data['main']['temp'];
    // let descValue = data['weather'][0]['description'];

    $('.name').html(nameValue);
    $('.temp').html(tempValue + '°F');
    // $('.desc').html(descValue);
}

const saveCity = function(){
    let cityBtnEl = $('<buttom type="submit">')
        .addClass('saved-cities container-fluid my-2')
        .prop('id', $('.name').text())
        .text($('.name').text());
    $('.searched-container').append(cityBtnEl);
}

const fetchCityData = function(cityName){
    fetch(weatherApi + cityName + formatUnits + apiKey)
    .then(response => response.json())
    .then(data => {
        getWeather(data);

        // check if city has been saved to previous searches
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

$('.button').on('click', function() {
    let cityName = $('#inputValue').val();
    fetchCityData(cityName);
})

$(document).on('click', '.saved-cities', function() {
    let cityName = $(this).attr('id');
    fetchCityData(cityName);
})