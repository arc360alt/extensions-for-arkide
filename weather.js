(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    alert('The Weather extension must be loaded unsandboxed to work correctly.');
  }

  const WMO_CODES = {
    0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
    45:'Fog',48:'Icy fog',51:'Light drizzle',53:'Moderate drizzle',55:'Dense drizzle',
    61:'Slight rain',63:'Moderate rain',65:'Heavy rain',71:'Slight snow',73:'Moderate snow',75:'Heavy snow',
    77:'Snow grains',80:'Slight showers',81:'Moderate showers',82:'Violent showers',
    85:'Slight snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm w/ hail',99:'Thunderstorm w/ heavy hail'
  };

  let savedLat = 40.7128;
  let savedLon = -74.0060;
  let savedLocationName = 'New York';
  let lastGeoError = '';
  let cachedData = null;
  let cacheTime = 0;
  const CACHE_TTL = 300000;

  let savedTempUnit = 'celsius';
  let savedWindUnit = 'kmh';

  async function fetchWeather(lat, lon, extra = '') {
    const now = Date.now();
    if (cachedData && now - cacheTime < CACHE_TTL && !extra) return cachedData;
    const base = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`;
    const defaults = `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,uv_index&wind_speed_unit=${savedWindUnit}&temperature_unit=${savedTempUnit}&timezone=auto`;
    const url = base + defaults + (extra ? '&' + extra : '');
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!extra) { cachedData = data; cacheTime = now; }
    return data;
  }

  async function geocode(query) {
    // Try original query, then strip "City, ST" -> "City" to improve hit rate
    const stripped = query.replace(/,\s*[A-Za-z]{2}$/, '').trim();
    const attempts = [...new Set([query, stripped])];
    for (const attempt of attempts) {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(attempt)}&count=5&language=en&format=json`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Geocode HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.results && data.results.length > 0) return data.results[0];
    }
    return null;
  }

  class WeatherExtension {
    getInfo() {
      return {
        id: 'openmeteoweather',
        name: 'Weather',
        color1: '#1a73e8',
        color2: '#1558b0',
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: '— Location —' },
          {
            opcode: 'setLocationByName',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set location to city [CITY]',
            arguments: { CITY: { type: Scratch.ArgumentType.STRING, defaultValue: 'Chicago' } }
          },
          {
            opcode: 'setLocationByCoords',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set location to lat [LAT] lon [LON]',
            arguments: {
              LAT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 51.5074 },
              LON: { type: Scratch.ArgumentType.NUMBER, defaultValue: -0.1278 }
            }
          },
          {
            opcode: 'setLocationByGPS',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set location to my GPS position'
          },
          {
            opcode: 'getLocationName',
            blockType: Scratch.BlockType.REPORTER,
            text: 'location name'
          },
          {
            opcode: 'getSavedLat',
            blockType: Scratch.BlockType.REPORTER,
            text: 'saved latitude'
          },
          {
            opcode: 'getSavedLon',
            blockType: Scratch.BlockType.REPORTER,
            text: 'saved longitude'
          },
          {
            opcode: 'getLastError',
            blockType: Scratch.BlockType.REPORTER,
            text: 'last location error'
          },
          { blockType: Scratch.BlockType.LABEL, text: '— Settings —' },
          {
            opcode: 'setTempUnit',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set temperature unit to [UNIT]',
            arguments: {
              UNIT: { type: Scratch.ArgumentType.STRING, menu: 'tempUnits', defaultValue: 'celsius' }
            }
          },
          {
            opcode: 'setWindUnit',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set wind speed unit to [UNIT]',
            arguments: {
              UNIT: { type: Scratch.ArgumentType.STRING, menu: 'windUnits', defaultValue: 'kmh' }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: '— Simple Weather —' },
          {
            opcode: 'getSimpleWeather',
            blockType: Scratch.BlockType.REPORTER,
            text: 'current [PARAM]',
            arguments: {
              PARAM: { type: Scratch.ArgumentType.STRING, menu: 'simpleParams', defaultValue: 'temperature_2m' }
            }
          },
          {
            opcode: 'getCondition',
            blockType: Scratch.BlockType.REPORTER,
            text: 'weather condition'
          },
          {
            opcode: 'getWeatherCode',
            blockType: Scratch.BlockType.REPORTER,
            text: 'weather code (WMO)'
          },
          {
            opcode: 'isRaining',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is it raining?'
          },
          {
            opcode: 'isSnowing',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is it snowing?'
          },
          {
            opcode: 'isClear',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is sky clear?'
          },
          { blockType: Scratch.BlockType.LABEL, text: '— Forecast —' },
          {
            opcode: 'getDailyForecast',
            blockType: Scratch.BlockType.REPORTER,
            text: '[PARAM] in [DAYS] days',
            arguments: {
              PARAM: { type: Scratch.ArgumentType.STRING, menu: 'forecastParams', defaultValue: 'temperature_2m_max' },
              DAYS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: '— Advanced —' },
          {
            opcode: 'getRawCurrent',
            blockType: Scratch.BlockType.REPORTER,
            text: 'raw current variable [VARIABLE]',
            arguments: { VARIABLE: { type: Scratch.ArgumentType.STRING, defaultValue: 'temperature_2m' } }
          },
          {
            opcode: 'customApiCall',
            blockType: Scratch.BlockType.REPORTER,
            text: 'custom API params [PARAMS] get key [KEY]',
            arguments: {
              PARAMS: { type: Scratch.ArgumentType.STRING, defaultValue: 'hourly=temperature_2m' },
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'hourly.temperature_2m.0' }
            }
          },
          {
            opcode: 'getTimezone',
            blockType: Scratch.BlockType.REPORTER,
            text: 'location timezone'
          },
          {
            opcode: 'clearCache',
            blockType: Scratch.BlockType.COMMAND,
            text: 'clear weather cache'
          }
        ],
        menus: {
          tempUnits: { acceptReporters: true, items: ['celsius','fahrenheit'] },
          windUnits: { acceptReporters: true, items: ['kmh','mph','ms','knots'] },
          simpleParams: {
            acceptReporters: false,
            items: [
              { text: 'temperature', value: 'temperature_2m' },
              { text: 'feels like', value: 'apparent_temperature' },
              { text: 'humidity %', value: 'relative_humidity_2m' },
              { text: 'precipitation mm', value: 'precipitation' },
              { text: 'wind speed', value: 'wind_speed_10m' },
              { text: 'wind direction °', value: 'wind_direction_10m' },
              { text: 'pressure hPa', value: 'surface_pressure' },
              { text: 'visibility m', value: 'visibility' },
              { text: 'UV index', value: 'uv_index' }
            ]
          },
          forecastParams: {
            acceptReporters: false,
            items: [
              { text: 'max temperature', value: 'temperature_2m_max' },
              { text: 'min temperature', value: 'temperature_2m_min' },
              { text: 'precipitation sum', value: 'precipitation_sum' },
              { text: 'max wind speed', value: 'wind_speed_10m_max' },
              { text: 'sunrise', value: 'sunrise' },
              { text: 'sunset', value: 'sunset' },
              { text: 'UV index max', value: 'uv_index_max' },
              { text: 'weather code', value: 'weather_code' }
            ]
          }
        }
      };
    }

    async setLocationByName({ CITY }) {
      lastGeoError = '';
      try {
        const result = await geocode(String(CITY).trim());
        if (result) {
          savedLat = result.latitude;
          savedLon = result.longitude;
          savedLocationName = result.name
            + (result.admin1 ? ', ' + result.admin1 : '')
            + (result.country ? ', ' + result.country : '');
          cachedData = null;
        } else {
          lastGeoError = `No results for "${CITY}" — try just the city name without state`;
        }
      } catch(e) {
        lastGeoError = `Geocode failed: ${e.message}`;
      }
    }

    setLocationByCoords({ LAT, LON }) {
      savedLat = parseFloat(LAT);
      savedLon = parseFloat(LON);
      savedLocationName = `${savedLat}, ${savedLon}`;
      cachedData = null;
      lastGeoError = '';
    }

    setLocationByGPS() {
      lastGeoError = '';
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          lastGeoError = 'Geolocation not supported by this browser.';
          return resolve();
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            savedLat = parseFloat(pos.coords.latitude.toFixed(6));
            savedLon = parseFloat(pos.coords.longitude.toFixed(6));
            savedLocationName = `My Location (${savedLat}, ${savedLon})`;
            cachedData = null;
            resolve();
          },
          (err) => {
            lastGeoError = `GPS error: ${err.message}`;
            resolve();
          },
          { timeout: 10000, maximumAge: 60000 }
        );
      });
    }

    getLocationName() { return savedLocationName; }
    getSavedLat() { return savedLat; }
    getSavedLon() { return savedLon; }
    getLastError() { return lastGeoError || 'none'; }

    setTempUnit({ UNIT }) { savedTempUnit = UNIT; cachedData = null; }
    setWindUnit({ UNIT }) { savedWindUnit = UNIT; cachedData = null; }

    async getSimpleWeather({ PARAM }) {
      try {
        const data = await fetchWeather(savedLat, savedLon);
        return data.current[PARAM] ?? '';
      } catch(e) { return `Error: ${e.message}`; }
    }

    async getCondition() {
      try {
        const data = await fetchWeather(savedLat, savedLon);
        const code = data.current.weather_code;
        return WMO_CODES[code] ?? `Code ${code}`;
      } catch(e) { return `Error: ${e.message}`; }
    }

    async getWeatherCode() {
      try {
        const data = await fetchWeather(savedLat, savedLon);
        return data.current.weather_code;
      } catch(e) { return -1; }
    }

    async isRaining() {
      try {
        const data = await fetchWeather(savedLat, savedLon);
        const c = data.current.weather_code;
        return (c >= 51 && c <= 67) || (c >= 80 && c <= 82);
      } catch(e) { return false; }
    }

    async isSnowing() {
      try {
        const data = await fetchWeather(savedLat, savedLon);
        const c = data.current.weather_code;
        return (c >= 71 && c <= 77) || (c >= 85 && c <= 86);
      } catch(e) { return false; }
    }

    async isClear() {
      try {
        const data = await fetchWeather(savedLat, savedLon);
        return data.current.weather_code <= 1;
      } catch(e) { return false; }
    }

    async getDailyForecast({ PARAM, DAYS }) {
      try {
        const idx = Math.max(0, Math.min(6, parseInt(DAYS)));
        const data = await fetchWeather(savedLat, savedLon, `daily=${PARAM}&forecast_days=7`);
        if (data.daily && data.daily[PARAM]) return data.daily[PARAM][idx] ?? '';
        return '';
      } catch(e) { return `Error: ${e.message}`; }
    }

    async getRawCurrent({ VARIABLE }) {
      try {
        const data = await fetchWeather(savedLat, savedLon);
        return data.current[VARIABLE] ?? '';
      } catch(e) { return `Error: ${e.message}`; }
    }

    async customApiCall({ PARAMS, KEY }) {
      try {
        const data = await fetchWeather(savedLat, savedLon, PARAMS);
        const keys = KEY.split('.');
        let val = data;
        for (const k of keys) {
          if (val == null) return '';
          const ki = parseInt(k);
          val = isNaN(ki) ? val[k] : val[ki];
        }
        return val ?? '';
      } catch(e) { return `Error: ${e.message}`; }
    }

    async getTimezone() {
      try {
        const data = await fetchWeather(savedLat, savedLon);
        return data.timezone ?? '';
      } catch(e) { return `Error: ${e.message}`; }
    }

    clearCache() { cachedData = null; cacheTime = 0; }
  }

  Scratch.extensions.register(new WeatherExtension());
})(Scratch);