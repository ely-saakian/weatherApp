// query by anything to get coords for the city
// with their api key
// https://openweathermap.org/data/2.5/find?q=98661&appid=439d4b804bc8187953eb36d2a8c26a02

// one call by coords
// https://api.openweathermap.org/data/2.5/onecall?lat=45.6418&lon=-122.6251&exclude=minutely&units=imperial

// api key
// a3345aba730886077c25b145c5518740

const apiKey = 'a3345aba730886077c25b145c5518740'
const searchButton = document.querySelector('.search-bar button')
const searchIcon = document.querySelector('.search-icon')
const searchModal = document.querySelector('.search-modal')
const weatherContainer = document.querySelector('.weather-container')

document.querySelector('.search-bar input').focus()
searchButton.addEventListener('click', searchByInput)
searchIcon.addEventListener('click', showModal)

function searchByInput (e) {
  e.preventDefault()
  const searchInput = document.querySelector('.search-bar input').value.trim()

  window.fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&units=imperial&appid=${apiKey}`)
    .then(data => data.json())
    .then(data => {
      console.log(data)
      document.querySelector('.search-bar input').value = ''
      displayWeather(data)
    })
    .catch(err => {
      console.log(err)
      showModal()
    })
}

function displayWeather (data) {
  searchModal.style.display = 'none'
  weatherContainer.style.display = 'block'

  const { lat, lon } = data.coord
  const city = data.name
  const country = data.sys.country
  const tempMin = parseInt(data.main.temp_min)
  const tempMax = parseInt(data.main.temp_max)

  getWeatherData(lat, lon, city, country, tempMin, tempMax)
}

function getWeatherData (lat, lon, city, country, tempMin, tempMax) {
  window.fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=imperial&appid=${apiKey}`)
    .then(data => data.json())
    .then(data => renderWeatherData(data, city, country, tempMin, tempMax))
}

function renderWeatherData (data, city, country, tempMin, tempMax) {
  console.log(data)
  const unit = '&deg;F'
  const currentTemp = parseInt(data.current.temp)
  const currentDescription = data.current.weather[0].description
  const currentIcon = data.current.weather[0].icon

  document.querySelector('[data-city-country]').innerHTML = `${city}, ${country}`
  document.querySelectorAll('[data-current-temp]').forEach(el => { el.innerHTML = `${currentTemp}${unit}` })
  document.querySelector('[data-current-temp-min]').innerHTML = `${tempMin}${unit}`
  document.querySelector('[data-current-temp-max]').innerHTML = `${tempMax}${unit}`
  document.querySelector('[data-current-description]').innerHTML = `${currentDescription}`
  document.querySelector('[data-current-icon]').src = `https://openweathermap.org/img/wn/${currentIcon}@4x.png`

  document.querySelectorAll('[data-hourly-hour]').forEach((el, index) => {
    const currentDate = new Date(data.hourly[index * 2].dt * 1000)
    if (index === 0) el.innerHTML = 'NOW'
    else {
      let hour = currentDate.getHours()
      const ampm = hour > 12 ? 'PM' : 'AM'
      hour = ((hour + 11) % 12 + 1)
      el.innerHTML = `${hour} ${ampm}`
    }
  })

  document.querySelectorAll('[data-hourly-temp]').forEach((el, index) => {
    const temp = parseInt(data.hourly[index * 2].temp)
    el.innerHTML = `${temp}${unit}`
  })

  document.querySelectorAll('[data-hourly-conditions]').forEach((el, index) => {
    const condition = data.hourly[index * 2].weather[0].main
    el.innerHTML = condition
  })

  document.querySelectorAll('[data-daily-day]').forEach((el, index) => {
    const currentDate = new Date(data.daily[index].dt * 1000)
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY'
    ]
    const day = days[currentDate.getDay()]
    el.innerHTML = index > 0 ? day : 'TODAY'
  })

  document.querySelectorAll('[data-daily-date]').forEach((el, index) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC']
    const currentDate = new Date(data.daily[index].dt * 1000)
    const date = currentDate.getDate()
    const month = months[currentDate.getMonth()]
    const year = currentDate.getFullYear()
    el.innerHTML = `${date} ${month} ${year}`
  })

  document.querySelectorAll('[data-daily-temp]').forEach((el, index) => {
    const temp = parseInt(data.daily[index].temp.max)
    el.innerHTML = `${temp}${unit}`
  })

  const today = document.querySelectorAll('.day-container')[0]
  updateDetails(data, today, unit)
  document.querySelectorAll('.day-container').forEach(el => el.addEventListener('click', () => updateDetails(data, el, unit)))
}

function updateDetails (data, el, unit) {
  document.querySelectorAll('.day-container').forEach(el => el.classList.remove('active'))
  el.classList.add('active')
  const index = el.dataset.index

  document.querySelector('[data-daily-conditions]').innerHTML = data.daily[index].weather[0].description
  document.querySelector('[data-daily-feels-like]').innerHTML = `${parseInt(data.daily[index].feels_like.day)}${unit}`

  const sunrise = moment(data.daily[index].sunrise * 1000).format('hh:mm:ss A')
  document.querySelector('[data-daily-sunrise]').innerHTML = sunrise
  const sunset = moment(data.daily[index].sunset * 1000).format('hh:mm:ss A')
  document.querySelector('[data-daily-sunset]').innerHTML = sunset
  document.querySelector('[data-daily-humidity]').innerHTML = `${data.daily[index].humidity}%`
  document.querySelector('[data-daily-wind]').innerHTML = `${data.daily[index].wind_speed} mi/hr`
  document.querySelector('[data-daily-uvi]').innerHTML = data.daily[index].uvi
}

function showModal () {
  searchModal.style.display = 'grid'
  document.querySelector('.search-bar input').focus()
  weatherContainer.style.display = 'none'
}
