<template>
    <div class="container">
        <h1>WEATHER APP</h1>
        <div class="search-bar">
            <input
                type="text"
                v-model="city"
                placeholder="Enter city name (e.g. Clayton, AU)"
                class="search-input"
                @keyup.enter="searchBycity"
                />
                <button @click="searchBycity" class="search-button">Search</button>
                <!-- <br>
                <br>
                Please implement "Search Weathe by City". -->
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
    </main>
</template>

<script>
import axios from "axios";
const apikey = "3b47aca296221ac8ba8a3d31a0d9418b";
export default {
    name: "App",
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
            :null;
        },

        iconUrl() {
            return this.weatherData
            ? `http://api.openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
            : null;
        },
    },

    mounted() {
        this.fetchCurrentLocationWeather();
    },
    
    methods: {
        async fetchCurrentLocationWeather() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
                    await this.fetchWeatherData(url);
                });
            }
        },
        async fetchWeatherData(url) {
            try {
                const response = await axios.get(url);
                this.weatherData = response.data;
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }
        },
        async searchBycity() {
            if (!this.city.trim()) {
                alert("Please enter a city name.");
                return;
            }
            const cityQuery = this.city.trim().replace(/\s+/g, '');
            const url = `http://api.openweathermap.org/data/2.5/weather?q=${cityQuery}&appid=${apikey}`;
            await this.fetchWeatherData(url);
        }
    }
}
</script>