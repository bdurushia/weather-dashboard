const weatherApi = 'https://api.openweathermap.org/data/2.5/weather?q=';
const apiKey = '&appid=e640147e850ba07b1d476b32c5705f94';
const formatUnits = '&units=imperial';

const getWeather = function(data) {
    let nameValue = data['name'];
    let tempValue = data['main']['temp'];
    let descValue = data['weather'][0]['description'];

    $('.name').html(nameValue);
    $('.temp').html(tempValue + '° F');
    $('.desc').html(descValue);
}

$('.button').on('click', function() {
    fetch(weatherApi + $('#inputValue').val() + formatUnits + apiKey)
        .then(response => response.json())
        .then(data => {
            getWeather(data);
        })
        .catch(err => console.log(err))
})