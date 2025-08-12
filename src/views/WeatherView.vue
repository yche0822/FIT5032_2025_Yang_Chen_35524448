<template>
    <div class="container">
        <h1>WEATHER APP</h1>
        <div class="search-bar">
            <input
                type="text"
                v-model="city"
                placeholder="Enter city name (e.g. Clayton, AU)"
                class="search-input"
                @keyup.enter="searchByCity"
                />
                <button @click="searchByCity" class="search-button">Get Weather</button>
        </div>
    </div>

    <main>
        <div v-if="weatherData">
            <h2>
                {{ weatherData.name }}, {{ weatherData.sys.country }}
            </h2>
            <div>
                <img :src="iconUrl" alt="Weather Icon" />
                <p>{{ temperature }} °C</p>
            </div>
            <span>{{ weatherData.weather[0].description }}</span>
        </div>
        <div v-else>
            <p>Loading weather data...</p>
        </div>
    </main>
</template>

<script>
import axios from "axios";
const apikey = "3b47aca296221ac8ba8a3d31a0d9418b";
export default {
    name: "WeatherView",
    data() {
        return {
            city: "",
            weatherData: null,
            hourlyForecast: [],
            dailyForecast: [],
        };
    },
    computed: {
        temperature() {
            return this.weatherData
            ? Math.floor(this.weatherData.main.temp - 273)
            : null;
        },

        iconUrl() {
            return this.weatherData
            ? `https://api.openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
            : null;
        },
    },

    mounted() {
        this.fetchCurrentLocationWeather();
        this.updateAddressBar();
    },
    
    methods: {
        async fetchCurrentLocationWeather() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
                    await this.fetchWeatherData(url);
                    this.updateAddressBar();
                });
            }
        },
        async fetchWeatherData(url) {
            try {
                const response = await axios.get(url);
                this.weatherData = response.data;
                this.updateAddressBar();
            } catch (error) {
                console.error("Error fetching weather data:", error);
                alert("Failed to fetch weather data. Please try again.");
            }
        },
        async searchByCity() {
            if (!this.city.trim()) {
                alert("Please enter a city name.");
                return;
            }
            const cityQuery = encodeURIComponent(this.city.trim());
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityQuery}&appid=${apikey}`;
            await this.fetchWeatherData(url);
            this.updateAddressBar();
        },
        updateAddressBar() {
            if (this.weatherData) {
                const newUrl = `${window.location.pathname}?city=${encodeURIComponent(this.weatherData.name)}`;
                window.history.pushState({}, '', newUrl);
            }
        }
    },
    created() {
        // Check for city in URL on load cy
        const params = new URLSearchParams(window.location.search);
        const cityParam = params.get('city');
        if (cityParam) {
            this.city = cityParam;
            this.searchByCity();
        }
    }
}
</script>

<style scoped>
.container {
    text-align: center;
    padding: 20px;
}
.search-bar {
    margin: 20px 0;
}
.search-input {
    padding: 10px;
    width: 300px;
    margin-right: 10px;
}
.search-button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
.search-button:hover {
    background-color: #45a049;
}
</style>