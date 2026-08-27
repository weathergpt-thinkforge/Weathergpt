// ==========================================
// WEATHER SEARCH
// ==========================================

async function searchWeather() {

    const cityInput = document.getElementById("cityInput");
    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city.");
        return;
    }

    try {

        // ==========================================
        // 1. FIND CITY
        // ==========================================

        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!locationResponse.ok) {
            throw new Error("Unable to find city.");
        }

        const locationData = await locationResponse.json();

        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {
            alert("City not found.");
            return;
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;



        // ==========================================
        // 2. GET WEATHER
        // ==========================================

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to load weather.");
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData.current || !weatherData.daily) {
            throw new Error("Weather data is incomplete.");
        }


        // ==========================================
        // 3. CITY NAME
        // ==========================================

        document.getElementById("cityName").innerText =
            location.name +
            (location.country ? ", " + location.country : "");


        // ==========================================
        // 4. CURRENT TEMPERATURE
        // ==========================================

        document.getElementById("temperature").innerText =
            Math.round(weatherData.current.temperature_2m) +
            "°C";


        // ==========================================
        // 5. WEATHER CONDITION
        // ==========================================

        document.getElementById("condition").innerText =
            getWeatherDescription(
                weatherData.current.weather_code
            );


        // ==========================================
        // 6. HUMIDITY
        // ==========================================

        document.getElementById("humidity").innerText =
            weatherData.current.relative_humidity_2m +
            "%";


        // ==========================================
        // 7. WIND
        // ==========================================

        document.getElementById("wind").innerText =
            Math.round(
                weatherData.current.wind_speed_10m
            ) +
            " km/h";


        // ==========================================
        // 8. RAIN CHANCE
        // ==========================================

        document.getElementById("rain").innerText =
            weatherData.daily
                .precipitation_probability_max[0] +
            "%";


        // ==========================================
        // 9. VISIBILITY
        // ==========================================

        document.getElementById("visibility").innerText =
            "Available";


        // ==========================================
        // 10. UPDATE FORECAST
        // ==========================================

        updateForecast(weatherData);


        // ==========================================
        // 11. WEATHER RISK
        // ==========================================

        checkWeatherRisk(weatherData);

        generateAgricultureAdvice(
            weatherData.current.temperature_2m,
            weatherData.daily.precipitation_probability_max[0],
            weatherData.current.wind_speed_10m,
            weatherData.current.weather_code
        );
        loadHourlyForecast(latitude, longitude);

        // ==========================================
        // 12. UPDATE MAP
        // ==========================================

        updateWeatherMap(
            latitude,
            longitude,
            location.name,
            Math.round(
                weatherData.current.temperature_2m
            ) + "°C",
            getWeatherDescription(
                weatherData.current.weather_code
            )
        );

    }

    catch (error) {

        console.error("Weather search error:", error);

        alert(
            "Something went wrong. Please try again."
        );
    }
}


// ==========================================
// WEATHER DESCRIPTION
// ==========================================

function getWeatherDescription(code) {

    if (code === 0) {
        return "Clear Sky ☀️";
    }

    if (code === 1 || code === 2) {
        return "Partly Cloudy ⛅";
    }

    if (code === 3) {
        return "Cloudy ☁️";
    }

    if (code >= 45 && code <= 48) {
        return "Foggy 🌫️";
    }

    if (code >= 51 && code <= 67) {
        return "Rainy 🌧️";
    }

    if (code >= 71 && code <= 77) {
        return "Snowy ❄️";
    }

    if (code >= 80 && code <= 82) {
        return "Rain Showers 🌦️";
    }

    if (code >= 85 && code <= 86) {
        return "Snow Showers 🌨️";
    }

    if (code >= 95) {
        return "Thunderstorm ⛈️";
    }

    return "Unknown";
}


// ==========================================
// 7-DAY FORECAST
// ==========================================

function updateForecast(weatherData) {

    const days = document.querySelectorAll(".day");

    if (!weatherData.daily) {
        return;
    }

    for (
        let i = 0;
        i < 7 && i < days.length;
        i++
    ) {

        const date = new Date(
            weatherData.daily.time[i]
        );

        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );

        days[i]
            .querySelector("p")
            .innerText = dayName;


        days[i]
            .querySelector("h3")
            .innerText =
            Math.round(
                weatherData.daily
                    .temperature_2m_max[i]
            ) +
            "°";


        days[i]
            .querySelector("span")
            .innerText =
            getWeatherIcon(
                weatherData.daily.weather_code[i]
            );
    }
}


// ==========================================
// WEATHER ICON
// ==========================================

function getWeatherIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (code === 1 || code === 2) {
        return "⛅";
    }

    if (code === 3) {
        return "☁️";
    }

    if (code >= 45 && code <= 48) {
        return "🌫️";
    }

    if (code >= 51 && code <= 67) {
        return "🌧️";
    }

    if (code >= 71 && code <= 77) {
        return "❄️";
    }

    if (code >= 80 && code <= 82) {
        return "🌦️";
    }

    if (code >= 85 && code <= 86) {
        return "🌨️";
    }

    if (code >= 95) {
        return "⛈️";
    }

    return "🌤️";
}


// ==========================================
// WEATHER CHATBOT
// ==========================================

function askQuestion() {

    const input = document.getElementById("questionInput");
    const question = input.value.trim();

    if (question === "") {
        return;
    }

    const chat = document.getElementById("chatMessages");

    // Show user message
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerText = question;
    chat.appendChild(userMessage);

    // Selected language
    const language = document.getElementById("languageSelect").value;

    // Current weather data from the page
    const temperature = document.getElementById("temperature").innerText;
    const humidity = document.getElementById("humidity").innerText;
    const wind = document.getElementById("wind").innerText;
    const rain = document.getElementById("rain").innerText;
    const condition = document.getElementById("condition").innerText;
    const city = document.getElementById("cityName").innerText;

    const q = question.toLowerCase();

    let answer = "";

    // ==========================================
    // ENGLISH
    // ==========================================

    if (language === "en") {

        // Rain
        if (
            q.includes("rain") ||
            q.includes("raining") ||
            q.includes("umbrella") ||
            q.includes("showers") ||
            q.includes("precipitation")
        ) {

            const rainValue = parseInt(rain);

            if (rainValue >= 70) {
                answer =
                    `🌧️ Yes, rain is quite likely in ${city}. ` +
                    `The chance of rain is ${rain}. You should carry an umbrella.`;
            }
            else if (rainValue >= 40) {
                answer =
                    `🌦️ There is a moderate chance of rain in ${city} today. ` +
                    `The rain probability is ${rain}. Carrying an umbrella would be a good idea.`;
            }
            else {
                answer =
                    `☀️ Rain is not very likely in ${city} right now. ` +
                    `The chance of rain is only ${rain}.`;
            }
        }

        // Temperature / Heat / Cold
        else if (
            q.includes("temperature") ||
            q.includes("hot") ||
            q.includes("cold") ||
            q.includes("heat") ||
            q.includes("cool") ||
            q.includes("warm")
        ) {

            answer =
                `🌡️ The current temperature in ${city} is ${temperature}. ` +
                `The weather condition is ${condition}.`;
        }

        // Humidity
        else if (
            q.includes("humidity") ||
            q.includes("humid") ||
            q.includes("moisture")
        ) {

            answer =
                `💧 The humidity in ${city} is currently ${humidity}. ` +
                `Higher humidity can make the weather feel warmer than the actual temperature.`;
        }

        // Wind
        else if (
            q.includes("wind") ||
            q.includes("windy") ||
            q.includes("breeze")
        ) {

            answer =
                `💨 The current wind speed in ${city} is ${wind}.`;
        }

        // Outdoor activity / Going outside
        else if (
            q.includes("outside") ||
            q.includes("outdoor") ||
            q.includes("go out") ||
            q.includes("travel") ||
            q.includes("trip")
        ) {

            const rainValue = parseInt(rain);

            if (rainValue >= 70) {
                answer =
                    `⚠️ Outdoor activities may not be ideal right now. ` +
                    `There is a ${rain} chance of rain in ${city}.`;
            }
            else if (rainValue >= 40) {
                answer =
                    `🌦️ You can go outside, but keep an umbrella with you. ` +
                    `There is a ${rain} chance of rain in ${city}.`;
            }
            else {
                answer =
                    `👍 The weather looks reasonably suitable for going outside. ` +
                    `It is ${temperature} with ${condition} conditions.`;
            }
        }

        // Safety
        else if (
            q.includes("safe") ||
            q.includes("danger") ||
            q.includes("risk") ||
            q.includes("warning")
        ) {

            const rainValue = parseInt(rain);
            const tempValue = parseInt(temperature);

            if (rainValue >= 70 || tempValue >= 38) {
                answer =
                    `⚠️ There may be some weather-related concerns. ` +
                    `Current conditions are ${condition}, temperature is ${temperature}, ` +
                    `and rain probability is ${rain}. Please check local weather warnings before travelling.`;
            }
            else {
                answer =
                    `🟢 Current conditions in ${city} appear relatively normal. ` +
                    `It is ${temperature} with ${condition} conditions.`;
            }
        }

        // General weather
        else if (
            q.includes("weather") ||
            q.includes("condition") ||
            q.includes("climate") ||
            q.includes("forecast")
        ) {

            answer =
                `🌦️ Here's the current weather in ${city}:\n\n` +
                `🌡️ Temperature: ${temperature}\n` +
                `🌤️ Condition: ${condition}\n` +
                `💧 Humidity: ${humidity}\n` +
                `💨 Wind: ${wind}\n` +
                `🌧️ Rain chance: ${rain}`;
        }

        // Greeting
        else if (
            q.includes("hello") ||
            q.includes("hi") ||
            q.includes("hey")
        ) {

            answer =
                `👋 Hey! I'm WeatherGPT. Ask me about the temperature, rain, humidity, wind, or whether it's a good time to go outside.`;
        }

        // Unknown question
        else {

            answer =
                `🤔 I can help you with weather-related questions! ` +
                `Try asking things like:\n\n` +
                `🌧️ "Will it rain today?"\n` +
                `🌡️ "Is it hot outside?"\n` +
                `☂️ "Should I carry an umbrella?"\n` +
                `💨 "Is it windy?"\n` +
                `🚶 "Is it safe to go outside?"`;
        }
    }


    // ==========================================
    // HINDI
    // ==========================================

    else if (language === "hi") {

        if (
            q.includes("बारिश") ||
            q.includes("rain") ||
            q.includes("छाता")
        ) {

            answer =
                `🌧️ ${city} में बारिश की संभावना ${rain} है। ` +
                `बारिश की संभावना के अनुसार छाता साथ रखना अच्छा रहेगा।`;
        }

        else if (
            q.includes("तापमान") ||
            q.includes("गर्मी") ||
            q.includes("ठंड") ||
            q.includes("temperature")
        ) {

            answer =
                `🌡️ ${city} में वर्तमान तापमान ${temperature} है। ` +
                `मौसम ${condition} है।`;
        }

        else if (
            q.includes("नमी") ||
            q.includes("humidity")
        ) {

            answer =
                `💧 ${city} में वर्तमान आर्द्रता ${humidity} है।`;
        }

        else if (
            q.includes("हवा") ||
            q.includes("wind")
        ) {

            answer =
                `💨 ${city} में हवा की गति ${wind} है।`;
        }

        else if (
            q.includes("मौसम") ||
            q.includes("weather") ||
            q.includes("forecast")
        ) {

            answer =
                `🌦️ ${city} का वर्तमान मौसम:\n\n` +
                `🌡️ तापमान: ${temperature}\n` +
                `🌤️ स्थिति: ${condition}\n` +
                `💧 आर्द्रता: ${humidity}\n` +
                `💨 हवा: ${wind}\n` +
                `🌧️ बारिश की संभावना: ${rain}`;
        }

        else {

            answer =
                `🤔 मैं मौसम से जुड़े सवालों में आपकी मदद कर सकता हूँ। ` +
                `बारिश, तापमान, हवा या मौसम के बारे में पूछें।`;
        }
    }


    // ==========================================
    // MALAYALAM
    // ==========================================

    else if (language === "ml") {

        if (
            q.includes("മഴ") ||
            q.includes("rain") ||
            q.includes("കുട")
        ) {

            answer =
                `🌧️ ${city}-ൽ ഇപ്പോൾ മഴയ്ക്കുള്ള സാധ്യത ${rain} ആണ്. ` +
                `മഴയ്ക്ക് സാധ്യതയുള്ളതിനാൽ കുട കൈയിൽ കരുതുന്നത് നല്ലതാണ്.`;
        }

        else if (
            q.includes("താപനില") ||
            q.includes("ചൂട്") ||
            q.includes("തണുപ്പ്") ||
            q.includes("temperature")
        ) {

            answer =
                `🌡️ ${city}-ലെ നിലവിലെ താപനില ${temperature} ആണ്. ` +
                `കാലാവസ്ഥ ${condition} ആണ്.`;
        }

        else if (
            q.includes("ഈർപ്പം") ||
            q.includes("humidity")
        ) {

            answer =
                `💧 ${city}-ലെ നിലവിലെ ഈർപ്പം ${humidity} ആണ്.`;
        }

        else if (
            q.includes("കാറ്റ്") ||
            q.includes("wind")
        ) {

            answer =
                `💨 ${city}-ലെ നിലവിലെ കാറ്റിന്റെ വേഗത ${wind} ആണ്.`;
        }

        else if (
            q.includes("കാലാവസ്ഥ") ||
            q.includes("weather") ||
            q.includes("forecast")
        ) {

            answer =
                `🌦️ ${city}-ലെ നിലവിലെ കാലാവസ്ഥ:\n\n` +
                `🌡️ താപനില: ${temperature}\n` +
                `🌤️ അവസ്ഥ: ${condition}\n` +
                `💧 ഈർപ്പം: ${humidity}\n` +
                `💨 കാറ്റ്: ${wind}\n` +
                `🌧️ മഴയ്ക്കുള്ള സാധ്യത: ${rain}`;
        }

        else {

            answer =
                `🤔 കാലാവസ്ഥയുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾക്ക് ഞാൻ സഹായിക്കാം. ` +
                `മഴ, താപനില, കാറ്റ്, ഈർപ്പം അല്ലെങ്കിൽ കാലാവസ്ഥയെക്കുറിച്ച് ചോദിക്കൂ.`;
        }
    }


    // ==========================================
    // DISPLAY ANSWER
    // ==========================================

    const botMessage = document.createElement("div");

    botMessage.className = "bot-message";

    botMessage.innerText = answer;

    chat.appendChild(botMessage);

    input.value = "";

    // Speak answer
    speakAnswer(answer);
}


// ==========================================
// DARK MODE
// ==========================================

const darkModeButton =
    document.getElementById(
        "darkModeButton"
    );

if (darkModeButton) {

    darkModeButton.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "dark"
            );

        }
    );
}


// ==========================================
// GET MY LOCATION
// ==========================================

function getMyLocation() {

    if (!navigator.geolocation) {

        alert(
            "Location is not supported by your browser."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            getWeatherByCoordinates(
                latitude,
                longitude
            );

        },

        function(error) {

            console.error(
                "Location error:",
                error
            );

            alert(
                "Please allow location access."
            );

        }
    );
}


// ==========================================
// WEATHER BY COORDINATES
// ==========================================

async function getWeatherByCoordinates(
    latitude,
    longitude
) {

    try {

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`
        );


        if (!
