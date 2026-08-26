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

    const input =
        document.getElementById("questionInput");

    const question =
        input.value.trim();

    if (question === "") {
        return;
    }

    const chat =
        document.getElementById("chatMessages");


    // User message

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "user-message";

    userMessage.innerText =
        question;

    chat.appendChild(
        userMessage
    );


    // Selected language

    const language =
        document.getElementById(
            "languageSelect"
        ).value;


    // Current weather

    const temperature =
        document.getElementById(
            "temperature"
        ).innerText;

    const humidity =
        document.getElementById(
            "humidity"
        ).innerText;

    const wind =
        document.getElementById(
            "wind"
        ).innerText;

    const rain =
        document.getElementById(
            "rain"
        ).innerText;

    const condition =
        document.getElementById(
            "condition"
        ).innerText;


    const lowerQuestion =
        question.toLowerCase();

    let answer = "";


    // ==========================================
    // ENGLISH
    // ==========================================

    if (language === "en") {

        if (
            lowerQuestion.includes("rain")
        ) {

            answer =
                "🌧️ The current rain probability is " +
                rain +
                ". The current condition is " +
                condition +
                ".";

        }

        else if (
            lowerQuestion.includes(
                "temperature"
            ) ||
            lowerQuestion.includes("hot") ||
            lowerQuestion.includes("cold")
        ) {

            answer =
                "🌡️ The current temperature is " +
                temperature +
                ".";

        }

        else if (
            lowerQuestion.includes(
                "humidity"
            )
        ) {

            answer =
                "💧 The current humidity is " +
                humidity +
                ".";

        }

        else if (
            lowerQuestion.includes("wind")
        ) {

            answer =
                "💨 The current wind speed is " +
                wind +
                ".";

        }

        else {

            answer =
                "🌦️ The current weather is " +
                condition +
                ". Temperature: " +
                temperature +
                ". Humidity: " +
                humidity +
                ". Wind: " +
                wind +
                ".";
        }
    }


    // ==========================================
    // HINDI
    // ==========================================

    else if (language === "hi") {

        if (
            lowerQuestion.includes("बारिश") ||
            lowerQuestion.includes("rain")
        ) {

            answer =
                "🌧️ बारिश की वर्तमान संभावना " +
                rain +
                " है। वर्तमान मौसम " +
                condition +
                " है।";

        }

        else if (
            lowerQuestion.includes("तापमान") ||
            lowerQuestion.includes("गर्मी") ||
            lowerQuestion.includes("temperature")
        ) {

            answer =
                "🌡️ वर्तमान तापमान " +
                temperature +
                " है।";

        }

        else if (
            lowerQuestion.includes("नमी") ||
            lowerQuestion.includes("humidity")
        ) {

            answer =
                "💧 वर्तमान आर्द्रता " +
                humidity +
                " है।";

        }

        else if (
            lowerQuestion.includes("हवा") ||
            lowerQuestion.includes("wind")
        ) {

            answer =
                "💨 वर्तमान हवा की गति " +
                wind +
                " है।";

        }

        else {

            answer =
                "🌦️ वर्तमान मौसम " +
                condition +
                " है। तापमान " +
                temperature +
                " है और आर्द्रता " +
                humidity +
                " है।";
        }
    }


    // ==========================================
    // MALAYALAM
    // ==========================================

    else if (language === "ml") {

        if (
            lowerQuestion.includes("മഴ") ||
            lowerQuestion.includes("rain")
        ) {

            answer =
                "🌧️ ഇപ്പോഴത്തെ മഴയ്ക്കുള്ള സാധ്യത " +
                rain +
                " ആണ്. നിലവിലെ കാലാവസ്ഥ " +
                condition +
                " ആണ്.";

        }

        else if (
            lowerQuestion.includes("താപനില") ||
            lowerQuestion.includes("temperature")
        ) {

            answer =
                "🌡️ ഇപ്പോഴത്തെ താപനില " +
                temperature +
                " ആണ്.";

        }

        else if (
            lowerQuestion.includes("ഈർപ്പം") ||
            lowerQuestion.includes("humidity")
        ) {

            answer =
                "💧 ഇപ്പോഴത്തെ ഈർപ്പം " +
                humidity +
                " ആണ്.";

        }

        else if (
            lowerQuestion.includes("കാറ്റ്") ||
            lowerQuestion.includes("wind")
        ) {

            answer =
                "💨 ഇപ്പോഴത്തെ കാറ്റിന്റെ വേഗത " +
                wind +
                " ആണ്.";

        }

        else {

            answer =
                "🌦️ നിലവിലെ കാലാവസ്ഥ " +
                condition +
                " ആണ്. താപനില " +
                temperature +
                " ആണ്. ഈർപ്പം " +
                humidity +
                " ആണ്.";
        }
    }


    // ==========================================
    // DISPLAY BOT ANSWER
    // ==========================================

    const botMessage =
        document.createElement("div");

    botMessage.className =
        "bot-message";

    botMessage.innerText =
        answer;

    chat.appendChild(
        botMessage
    );

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


        if (!response.ok) {
            throw new Error(
                "Weather request failed."
            );
        }


        const data =
            await response.json();

            loadHourlyForecast(
                latitude,
                longitude
            );


        if (
            !data.current ||
            !data.daily
        ) {

            throw new Error(
                "Weather data is incomplete."
            );
        }


        const condition =
            getWeatherDescription(
                data.current.weather_code
            );

        const temperature =
            Math.round(
                data.current.temperature_2m
            ) +
            "°C";


        // Update city

        document.getElementById(
            "cityName"
        ).innerText =
            "Your Location";


        // Temperature

        document.getElementById(
            "temperature"
        ).innerText =
            temperature;


        // Condition

        document.getElementById(
            "condition"
        ).innerText =
            condition;


        // Humidity

        document.getElementById(
            "humidity"
        ).innerText =
            data.current
                .relative_humidity_2m +
            "%";


        // Wind

        document.getElementById(
            "wind"
        ).innerText =
            Math.round(
                data.current.wind_speed_10m
            ) +
            " km/h";


        // Rain

        document.getElementById(
            "rain"
        ).innerText =
            data.daily
                .precipitation_probability_max[0] +
            "%";


        // Visibility

        document.getElementById(
            "visibility"
        ).innerText =
            "Available";


        // Forecast

        updateForecast(data);


        // Risk

        checkWeatherRisk(data);


        // Map

        updateWeatherMap(
            latitude,
            longitude,
            "Your Location",
            temperature,
            condition
        );

    }

    catch (error) {

        console.error(
            "Location weather error:",
            error
        );

        alert(
            "Unable to get weather for your location."
        );
    }
}


// ==========================================
// WEATHER RISK
// ==========================================

function checkWeatherRisk(weatherData) {

    if (
        !weatherData ||
        !weatherData.current ||
        !weatherData.daily
    ) {
        return;
    }


    const rainChance =
        weatherData.daily
            .precipitation_probability_max[0];

    const weatherCode =
        weatherData.current.weather_code;

    const temperature =
        weatherData.current.temperature_2m;


    const riskAlert =
        document.getElementById(
            "riskAlert"
        );

    const riskMessage =
        document.getElementById(
            "riskMessage"
        );


    if (!riskAlert || !riskMessage) {
        return;
    }


    // Thunderstorm

    if (weatherCode >= 95) {

        riskAlert.innerText =
            "🔴 HIGH RISK — Thunderstorm detected";

        riskMessage.innerText =
            "Thunderstorms may occur. Consider avoiding unnecessary outdoor activities and follow local weather warnings.";

        return;
    }


    // Heavy rain

    if (rainChance >= 70) {

        riskAlert.innerText =
            "🔴 HIGH RISK — Heavy rain possible";

        riskMessage.innerText =
            "There is a high probability of rain. Be careful while travelling and watch for local weather warnings.";

        return;
    }


    // Moderate rain

    if (rainChance >= 40) {

        riskAlert.innerText =
            "🟡 MODERATE RISK — Rain possible";

        riskMessage.innerText =
            "Rain is possible today. Carry suitable rain protection and monitor the forecast.";

        return;
    }


    // High temperature

    if (temperature >= 38) {

        riskAlert.innerText =
            "🟡 MODERATE RISK — High temperature";

        riskMessage.innerText =
            "Temperatures are high. Stay hydrated and avoid unnecessary exposure to strong heat.";

        return;
    }


    // Normal weather

    riskAlert.innerText =
        "🟢 LOW RISK — No major weather risk detected";

    riskMessage.innerText =
        "Current weather conditions appear relatively normal. Continue monitoring the forecast.";
}


// ==========================================
// VOICE INPUT
// =====================================

let recognition = null;


function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice recognition is not supported in this browser. Please use Chrome."
        );

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        true;


    const language =
        document.getElementById(
            "languageSelect"
        ).value;


    if (language === "en") {

        recognition.lang =
            "en-IN";

    }

    else if (language === "hi") {

        recognition.lang =
            "hi-IN";

    }

    else if (language === "ml") {

        recognition.lang =
            "ml-IN";
    }


    const voiceOverlay =
        document.getElementById(
            "voiceOverlay"
        );

    const voiceTitle =
        document.getElementById(
            "voiceTitle"
        );

    const voiceText =
        document.getElementById(
            "voiceText"
        );


    voiceOverlay.style.display =
        "flex";

    voiceTitle.innerText =
        "Listening...";

    voiceText.innerText =
        "Speak now";


    try {

        recognition.start();

    }

    catch (error) {

        console.error(
            "Voice start error:",
            error
        );

        return;
    }


    recognition.onresult =
        function(event) {

            let transcript = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;
            }


            voiceText.innerText =
                transcript;


            if (
                event.results[
                    event.results.length - 1
                ].isFinal
            ) {

                document.getElementById(
                    "questionInput"
                ).value =
                    transcript;


                voiceTitle.innerText =
                    "Got it!";


                setTimeout(
                    function() {

                        voiceOverlay.style.display =
                            "none";

                        askQuestion();

                    },
                    700
                );
            }
        };


    recognition.onerror =
        function(event) {

            console.error(
                "Voice error:",
                event.error
            );


            voiceTitle.innerText =
                "Couldn't hear you";

            voiceText.innerText =
                "Please try again";


            setTimeout(
                function() {

                    voiceOverlay.style.display =
                        "none";

                },
                1500
            );
        };
}


// ==========================================
// STOP VOICE
// ==========================================

function stopVoice() {

    if (recognition) {

        try {
            recognition.stop();
        }

        catch (error) {
            console.log(error);
        }
    }


    const overlay =
        document.getElementById(
            "voiceOverlay"
        );

    if (overlay) {

        overlay.style.display =
            "none";
    }
}


// ==========================================
// VOICE ANSWER
// ==========================================

function speakAnswer(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;
    }


    window.speechSynthesis.cancel();


    const language =
        document.getElementById(
            "languageSelect"
        ).value;


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    if (language === "en") {

        speech.lang =
            "en-IN";

    }

    else if (language === "hi") {

        speech.lang =
            "hi-IN";

    }

    else if (language === "ml") {

        speech.lang =
            "ml-IN";
    }


    speech.rate =
        0.85;

    speech.pitch =
        1;

    speech.volume =
        1;


    const voices =
        window.speechSynthesis
            .getVoices();


    const languageCode =
        speech.lang
            .toLowerCase()
            .split("-")[0];


    const selectedVoice =
        voices.find(
            function(voice) {

                return voice.lang
                    .toLowerCase()
                    .startsWith(
                        languageCode
                    );
            }
        );


    if (selectedVoice) {

        speech.voice =
            selectedVoice;
    }


    window.speechSynthesis.speak(
        speech
    );
}


if (
    "speechSynthesis" in window
) {

    window.speechSynthesis.onvoiceschanged =
        function() {

            window.speechSynthesis
                .getVoices();

        };
}


// ==========================================
// STOP SPEAKING
// ==========================================

function stopSpeaking() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();
    }
}


// ==========================================
// HISTORICAL CLIMATE ANALYSIS
// ==========================================

async function getClimateData() {

    const year =
        document.getElementById(
            "climateYear"
        ).value;


    if (year === "") {

        alert(
            "Please enter a year."
        );

        return;
    }


    const city =
        document.getElementById(
            "cityInput"
        ).value.trim();


    if (city === "") {

        alert(
            "Please search for a city first."
        );

        return;
    }


    try {

        // ==========================================
        // FIND CITY
        // ==========================================

        const locationResponse =
            await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
            );


        if (!locationResponse.ok) {

            throw new Error(
                "Unable to find city."
            );
        }


        const locationData =
            await locationResponse.json();


        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {

            alert(
                "City not found."
            );

            return;
        }


        const location =
            locationData.results[0];


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        // ==========================================
        // DATES
        // ==========================================

        const startDate =
            year + "-01-01";

        const endDate =
            year + "-12-31";


        // ==========================================
        // HISTORICAL WEATHER
        // ==========================================

        const weatherResponse =
            await fetch(
                `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
            );


        if (!weatherResponse.ok) {

            throw new Error(
                "Historical weather request failed."
            );
        }


        const weatherData =
            await weatherResponse.json();


        if (!weatherData.daily) {

            alert(
                "Historical data is not available."
            );

            return;
        }


        const temperatures =
            weatherData.daily
                .temperature_2m_mean || [];


        const maxTemperatures =
            weatherData.daily
                .temperature_2m_max || [];


        const minTemperatures =
            weatherData.daily
                .temperature_2m_min || [];


        const rainfall =
            weatherData.daily
                .precipitation_sum || [];


        // ==========================================
        // REMOVE MISSING VALUES
        // ==========================================

        const validTemperatures =
            temperatures.filter(
                value =>
                    value !== null &&
                    Number.isFinite(value)
            );


        const validMax =
            maxTemperatures.filter(
                value =>
                    value !== null &&
                    Number.isFinite(value)
            );


        const validMin =
            minTemperatures.filter(
                value =>
                    value !== null &&
                    Number.isFinite(value)
            );


        const validRainfall =
            rainfall.filter(
                value =>
                    value !== null &&
                    Number.isFinite(value)
            );


        if (
            validTemperatures.length === 0 ||
            validMax.length === 0 ||
            validMin.length === 0
        ) {

            alert(
                "No usable historical weather data was found."
            );

            return;
        }


        // ==========================================
        // CALCULATIONS
        // ==========================================

        const averageTemperature =
            validTemperatures.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) /
            validTemperatures.length;


        const highestTemperature =
            Math.max(
                ...validMax
            );


        const lowestTemperature =
            Math.min(
                ...validMin
            );


        const totalRainfall =
            validRainfall.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        // ==========================================
        // DISPLAY
        // ==========================================

        document.getElementById(
            "avgTemperature"
        ).innerText =
            averageTemperature.toFixed(1) +
            "°C";


        document.getElementById(
            "maxTemperature"
        ).innerText =
            highestTemperature.toFixed(1) +
            "°C";


        document.getElementById(
            "minTemperature"
        ).innerText =
            lowestTemperature.toFixed(1) +
            "°C";


        document.getElementById(
            "totalRainfall"
        ).innerText =
            totalRainfall.toFixed(1) +
            " mm";


        document.getElementById(
            "climateResult"
        ).innerText =
            "📍 " +
            location.name +
            " — Historical analysis for " +
            year +
            " completed successfully.";

    }

    catch (error) {

        console.error(
            "Climate error:",
            error
        );

        
        alert(
            "Unable to load historical weather data."
        );
    }
}


// ==========================================
// WEATHER MAP
// ==========================================

let weatherMap = null;

let weatherMarker = null;


// ==========================================
// CREATE MAP
// ==========================================

function createWeatherMap() {

    const mapElement =
        document.getElementById(
            "weatherMap"
        );


    if (!mapElement) {

        console.error(
            "Weather map element not found."
        );

        return;
    }


    // Prevent creating map twice

    if (weatherMap !== null) {
        return;
    }


    // Make sure Leaflet loaded

    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet library is not loaded."
        );

        return;
    }


    weatherMap =
        L.map(
            "weatherMap"
        ).setView(
            [20, 78],
            5
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        weatherMap
    );
}


// ==========================================
// UPDATE MAP
// ==========================================

function updateWeatherMap(
    latitude,
    longitude,
    cityName,
    temperature,
    condition
) {

    // If map isn't ready yet, create it

    if (weatherMap === null) {

        createWeatherMap();
    }


    // If Leaflet/map still isn't available

    if (
        weatherMap === null
    ) {

        console.error(
            "Weather map is not available."
        );

        return;
    }


    // Move map

    weatherMap.setView(
        [
            latitude,
            longitude
        ],
        10
    );


    // Remove previous marker

    if (
        weatherMarker !== null
    ) {

        weatherMap.removeLayer(
            weatherMarker
        );
    }


    // Create marker

    weatherMarker =
        L.marker(
            [
                latitude,
                longitude
            ]
        ).addTo(
            weatherMap
        );


    // Popup

    weatherMarker
        .bindPopup(
            `<b>${cityName}</b><br>
            🌡️ ${temperature}<br>
            🌦️ ${condition}`
        )
        .openPopup();


    // Information below map

    const mapInfo =
        document.getElementById(
            "mapWeatherInfo"
        );


    if (mapInfo) {

        mapInfo.innerHTML =
            `📍 <b>${cityName}</b><br>
            🌡️ Temperature: ${temperature}<br>
            🌦️ Condition: ${condition}`;
    }
}


// ==========================================
// START MAP AFTER PAGE LOADS
// ==========================================

window.addEventListener(
    "load",
    function() {

        createWeatherMap();

    }
);

// ==========================================
// HOURLY FORECAST
// ==========================================

async function loadHourlyForecast(latitude, longitude) {

    try {

        let response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&forecast_days=2&timezone=auto`
        );

        let data = await response.json();

        let times = data.hourly.time;
        let temperatures = data.hourly.temperature_2m;
        let rain = data.hourly.precipitation_probability;
        let weatherCodes = data.hourly.weather_code;
        let wind = data.hourly.wind_speed_10m;

        // Draw temperature graph

         drawTemperatureGraph(
           temperatures,
           times
           );

        let container =
            document.getElementById("hourlyForecast");

        container.innerHTML = "";

        // Find the current hour

        let currentHour = new Date().getHours();

        let shown = 0;

        for (let i = 0; i < times.length; i++) {

            let forecastTime =
                new Date(times[i]);

            if (forecastTime.getHours() < currentHour) {
                continue;
            }

            if (shown >= 12) {
                break;
            }

            let card =
                document.createElement("div");

            card.className = "hour-card";

            let time =
                forecastTime.toLocaleTimeString(
                    [],
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );

            let icon =
                getWeatherIcon(weatherCodes[i]);

            card.innerHTML = `

                <div class="hour-time">
                    ${time}
                </div>

                <div class="hour-icon">
                    ${icon}
                </div>

                <div class="hour-temp">
                    ${Math.round(temperatures[i])}°C
                </div>

                <div class="hour-rain">
                    🌧️ ${rain[i]}%
                </div>

                <div class="hour-rain">
                    💨 ${Math.round(wind[i])} km/h
                </div>

            `;

            container.appendChild(card);

            shown++;
        }

    }

    catch (error) {

        console.log("Hourly forecast error:", error);

        document.getElementById(
            "hourlyForecast"
        ).innerHTML =
            "❌ Unable to load hourly forecast.";

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
        return "🌤️";
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

    if (code >= 95) {
        return "⛈️";
    }

    return "🌤️";
}

// ==========================================
// TEMPERATURE GRAPH
// ==========================================

function drawTemperatureGraph(temperatures, times) {

    const canvas = document.getElementById("temperatureChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Next 12 hours
    const values = temperatures.slice(0, 12);
    const labels = times.slice(0, 12);

    if (values.length < 2) return;

    // Graph area
    const left = 45;
    const right = 15;
    const top = 20;
    const bottom = 35;

    const graphWidth = width - left - right;
    const graphHeight = height - top - bottom;

    // Temperature range
    let minTemp = Math.floor(Math.min(...values) - 1);
    let maxTemp = Math.ceil(Math.max(...values) + 1);

    if (minTemp === maxTemp) {
        maxTemp++;
        minTemp--;
    }

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Text color
    const textColor =
        document.body.classList.contains("dark")
            ? "#ffffff"
            : "#333333";

    const gridColor =
        document.body.classList.contains("dark")
            ? "#4a5965"
            : "#dddddd";

    // =====================================
    // Y AXIS + GRID
    // =====================================

    ctx.font = "11px Arial";
    ctx.textAlign = "right";

    const scaleSteps = 5;

    for (let i = 0; i <= scaleSteps; i++) {

        const temp =
            minTemp +
            ((maxTemp - minTemp) / scaleSteps) * i;

        const y =
            top +
            graphHeight -
            (i / scaleSteps) * graphHeight;

        // Grid line
        ctx.beginPath();

        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);

        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;

        ctx.stroke();

        // Temperature label
        ctx.fillStyle = textColor;

        ctx.fillText(
            Math.round(temp) + "°C",
            left - 7,
            y + 4
        );
    }


    // =====================================
    // AXES
    // =====================================

    ctx.beginPath();

    // Y axis
    ctx.moveTo(left, top);
    ctx.lineTo(left, height - bottom);

    // X axis
    ctx.lineTo(width - right, height - bottom);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1.5;

    ctx.stroke();


    // =====================================
    // TEMPERATURE LINE
    // =====================================

    ctx.beginPath();

    values.forEach((temp, index) => {

        const x =
            left +
            (index / (values.length - 1)) *
            graphWidth;

        const y =
            top +
            graphHeight -
            ((temp - minTemp) /
            (maxTemp - minTemp)) *
            graphHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

    });

    ctx.strokeStyle = "#1769aa";
    ctx.lineWidth = 3;

    ctx.stroke();


    // =====================================
    // TEMPERATURE POINTS
    // =====================================

    values.forEach((temp, index) => {

        const x =
            left +
            (index / (values.length - 1)) *
            graphWidth;

        const y =
            top +
            graphHeight -
            ((temp - minTemp) /
            (maxTemp - minTemp)) *
            graphHeight;


        // Point
        ctx.beginPath();

        ctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#1769aa";

        ctx.fill();


        // Temperature above point
        ctx.font = "10px Arial";

        ctx.textAlign = "center";

        ctx.fillStyle = textColor;

        ctx.fillText(
            Math.round(temp) + "°",
            x,
            y - 8
        );

    });


    // =====================================
    // X AXIS TIME LABELS
    // =====================================

    ctx.font = "10px Arial";

    ctx.textAlign = "center";

    labels.forEach((time, index) => {

        // Show every 2nd label
        if (index % 2 !== 0) return;

        const date = new Date(time);

        const x =
            left +
            (index / (labels.length - 1)) *
            graphWidth;

        const label =
            date.toLocaleTimeString([], {
                hour: "numeric"
            });

        ctx.fillStyle = textColor;

        ctx.fillText(
            label,
            x,
            height - 10
        );

    });


    // =====================================
    // AXIS TITLES
    // =====================================

    // Y-axis title
    ctx.save();

    ctx.translate(10, height / 2);

    ctx.rotate(-Math.PI / 2);

    ctx.font = "11px Arial";

    ctx.fillStyle = textColor;

    ctx.textAlign = "center";

    ctx.fillText(
        "Temperature (°C)",
        0,
        0
    );

    ctx.restore();


    // X-axis title
    ctx.font = "11px Arial";

    ctx.textAlign = "center";

    ctx.fillStyle = textColor;

    ctx.fillText(
        "Time",
        left + graphWidth / 2,
        height
    );

}

// ==========================================
// AGRICULTURE ADVISORY
// ==========================================
 {

    let advice = "";

    // Rain
    if (rainProbability >= 70) {

        advice +=
            "🌧️ <b>Rain:</b> High chance of rain today. " +
            "Consider postponing irrigation and monitor " +
            "the field for excess water.<br><br>";

    }

    else if (rainProbability >= 40) {

        advice +=
            "🌦️ <b>Rain:</b> Rain is possible. " +
            "Plan irrigation carefully.<br><br>";

    }

    else {

        advice +=
            "☀️ <b>Rain:</b> Low chance of rain. " +
            "Check soil moisture before irrigation.<br><br>";

    }


    // Temperature
    if (temperature >= 35) {

        advice +=
            "🌡️ <b>Temperature:</b> High temperature. " +
            "Avoid unnecessary outdoor farm work during " +
            "the hottest part of the day.<br><br>";

    }

    else {

        advice +=
            "🌡️ <b>Temperature:</b> Temperature is " +
            "relatively moderate for outdoor activities.<br><br>";

    }


    // Wind
    if (windSpeed >= 30) {

        advice +=
            "💨 <b>Wind:</b> Strong winds are possible. " +
            "Use caution with spraying and protect " +
            "young plants where appropriate.<br><br>";

    }

    else {

        advice +=
            "💨 <b>Wind:</b> Wind conditions are relatively calm.<br><br>";

    }


    // Thunderstorm
    if (weatherCode >= 95) {

        advice +=
            "⛈️ <b>Warning:</b> Thunderstorm conditions " +
            "are possible. Follow local weather warnings " +
            "and avoid unnecessary outdoor activities.";

    }


    document.getElementById(
        "agricultureAdvice"
    ).innerHTML = advice;

}


// ==========================================
// AGRICULTURE ADVISORY
// ==========================================

function generateAgricultureAdvice(
    temperature,
    rainProbability,
    windSpeed,
    weatherCode
) {

    const adviceBox =
        document.getElementById(
            "agricultureAdvice"
        );

    if (!adviceBox) {
        return;
    }

    let advice = "";

    // Rain advice
    if (rainProbability >= 70) {

        advice +=
            "🌧️ <b>Rain:</b> High chance of rain. " +
            "Consider postponing irrigation and " +
            "monitor fields for excess water.<br><br>";

    } else if (rainProbability >= 40) {

        advice +=
            "🌦️ <b>Rain:</b> Rain is possible. " +
            "Plan irrigation carefully.<br><br>";

    } else {

        advice +=
            "☀️ <b>Rain:</b> Low chance of rain. " +
            "Check soil moisture before irrigation.<br><br>";
    }


    // Temperature advice
    if (temperature >= 35) {

        advice +=
            "🌡️ <b>Temperature:</b> High temperature. " +
            "Take precautions during outdoor farm work.<br><br>";

    } else {

        advice +=
            "🌡️ <b>Temperature:</b> Conditions are " +
            "relatively moderate.<br><br>";
    }


    // Wind advice
    if (windSpeed >= 30) {

        advice +=
            "💨 <b>Wind:</b> Strong winds are possible. " +
            "Use caution with spraying and protect " +
            "young plants where appropriate.<br><br>";

    } else {

        advice +=
            "💨 <b>Wind:</b> Wind conditions are " +
            "relatively calm.<br><br>";
    }


    // Thunderstorm
    if (weatherCode >= 95) {

        advice +=
            "⛈️ <b>Weather Alert:</b> Thunderstorm " +
            "conditions are possible. Follow local " +
            "weather warnings.";
    }


    adviceBox.innerHTML = advice;
}