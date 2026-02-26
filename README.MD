# mawaqit
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme) ![npm](https://img.shields.io/npm/v/@max-xoo/mawaqit?color=green) [![npm download month](https://img.shields.io/npm/dm/@max-xoo/mawaqit.svg)](https://www.npmjs.com/package/@max-xoo/mawaqit)

A Node.js wrapper around [Mawaqit](https://mawaqit.net/), fetching mosque prayer times with built-in cache, country-wide mosque listings, and search.

## Table of Contents
- [Install](#install)
- [Usage](#usage)
  - [Prayer Times](#prayer-times)
  - [Calendar](#calendar)
  - [Mosque Info](#mosque-info)
  - [Country / Map](#country--map)
  - [Geolocation](#geolocation)
  - [Search](#search)
  - [Bulk Operations](#bulk-operations)
  - [Raw Data](#raw-data)
- [Cache](#cache)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## Install
```sh
npm install @max-xoo/mawaqit
```

## Usage
This package is meant to be used in the backend (Node.js).
All methods return a promise. The mosque slug is the one found in the mawaqit.net URL (e.g. `https://mawaqit.net/fr/zawiya-tidjaniya-trappes`).

### Prayer Times
```js
const mawaqit = require("@max-xoo/mawaqit");

const times = await mawaqit.getPrayerTimesOfTheDay("zawiya-tidjaniya-trappes");
// { fajr, sunrise, dohr, asr, maghreb, icha }

const iqama = await mawaqit.getIqamaTimes("zawiya-tidjaniya-trappes");
// { fajr, dohr, asr, maghreb, icha } (today's iqama, null if disabled)

const next = await mawaqit.getNextPrayer("zawiya-tidjaniya-trappes");
// { name: "asr", time: "16:45" } or { name: "fajr", time: "05:30", tomorrow: true }

const jumua = await mawaqit.getJumuaTimes("zawiya-tidjaniya-trappes");
// { jumua: "13:00", jumua2: "13:40", jumuaAsDuhr: false }
```

### Calendar
```js
const calendar = await mawaqit.getCalendar("zawiya-tidjaniya-trappes");
// Full year calendar (12 months)

const march = await mawaqit.getMonth("zawiya-tidjaniya-trappes", 3);
// [{ fajr, sunrise, dohr, asr, maghreb, icha }, ...] for each day

const day = await mawaqit.getDay("zawiya-tidjaniya-trappes", 3, 15);
// { fajr, sunrise, dohr, asr, maghreb, icha } for March 15

const iqamaMarch = await mawaqit.getMonthIqama("zawiya-tidjaniya-trappes", 3);
// [{ fajr, dohr, asr, maghreb, icha }, ...] for each day
```

### Mosque Info
```js
const services = await mawaqit.getServices("zawiya-tidjaniya-trappes");
// { name, label, localisation, phone, email, site, mosqueeType, association }

const info = await mawaqit.getMosqueInfo("zawiya-tidjaniya-trappes");
// Full info: name, label, localisation, phone, email, site, image,
// womenSpace, janazaPrayer, aidPrayer, childrenCourses, adultCourses,
// ramadanMeal, handicapAccessibility, ablutions, parking, iqamaEnabled, ...

const announcements = await mawaqit.getAnnouncements("zawiya-tidjaniya-trappes");
// [{ ... }]

const flash = await mawaqit.getFlashMessage("zawiya-tidjaniya-trappes");
// string or null
```

### Country / Map
Fetch all mosques registered on Mawaqit for a given country using 2-letter ISO codes.
```js
const mosques = await mawaqit.getMosquesByCountry("FR");
// [{ slug, name, image1, address, city, zipcode, countryFullName, lng, lat }, ...]

const count = await mawaqit.getMosquesByCountryCount("FR");
// 4500

const byCity = await mawaqit.getMosquesByCity("FR", "Paris");
// All mosques in Paris

const byZip = await mawaqit.getMosquesByZipcode("FR", "78000");
// All mosques with zipcode 78000

const byName = await mawaqit.getMosquesByName("FR", "essalam");
// All mosques whose name contains "essalam"
```

### Geolocation
Find mosques near GPS coordinates. Distance is returned in km.
```js
const nearby = await mawaqit.getMosquesByRadius("FR", 48.8566, 2.3522, 5);
// Mosques within 5km of central Paris, sorted by distance
// [{ slug, name, city, distance: 0.8, ... }, ...]

const nearest = await mawaqit.getNearestMosque("FR", 48.8566, 2.3522);
// Single closest mosque or null

const top5 = await mawaqit.getNearestMosques("FR", 48.8566, 2.3522, 5);
// 5 closest mosques
```

### Search
Uses Mawaqit's search API to find mosques by name, city, or zipcode.
```js
const results = await mawaqit.searchMosques("versailles", "slug,label");
// Full search results from the API

const byName = await mawaqit.searchByName("mosquée de versailles");
const byZip = await mawaqit.searchByZipcode("78000");
const byCity = await mawaqit.searchByCity("Versailles");
// Shorthand searches returning [{ slug, label, ... }]

const full = await mawaqit.searchFull("versailles");
// All fields returned (uuid, name, type, times, iqama, jumua, ...)

const withTimes = await mawaqit.searchWithTimes("versailles");
// [{ slug, name, localisation, times: { fajr, ... }, iqama, jumua }]
```

### Bulk Operations
```js
const all = await mawaqit.getAllCountryMosquesWithTimes("FR");
// All mosques in France with today's prayer times (slow, use with care)

const multi = await mawaqit.getMultipleMosqueTimes([
  "zawiya-tidjaniya-trappes",
  "mosquee-de-versailles-versailles-78000-france",
]);
// { "zawiya-tidjaniya-trappes": { fajr, ... }, "mosquee-de-...": { fajr, ... } }
```

### Raw Data
```js
const raw = await mawaqit.fetchMawaqit("zawiya-tidjaniya-trappes");
// Full confData object from mawaqit.net

const rawConf = await mawaqit.getRawConfData("zawiya-tidjaniya-trappes");
// Same as above (alias)
```

## Cache
Data is cached in memory with different TTLs depending on the type:
- **confData** (prayer times): resets at **midnight**
- **Country/map data**: cached for **6 hours**
- **Search results**: cached for **30 minutes**

```js
mawaqit.clearCache();                          // Clear all entries
mawaqit.deleteCacheEntry("conf:mosque-slug");  // Clear a specific mosque
const size = mawaqit.getCacheSize();           // Number of cached entries
const keys = mawaqit.getCacheKeys();           // List all cache keys
const exists = mawaqit.hasCache("conf:slug");  // Check if key is cached
```

## Error Handling
```js
const {
  MawaqitNotFoundError,
  MawaqitParseError,
  MawaqitFetchError,
  MawaqitValidationError,
  MawaqitSearchError,
  MawaqitCountryError,
} = require("@max-xoo/mawaqit");

try {
  const times = await mawaqit.getPrayerTimesOfTheDay("unknown-mosque");
} catch (err) {
  if (err instanceof MawaqitNotFoundError) {
    console.error("Mosque not found:", err.message);   // 404
  } else if (err instanceof MawaqitFetchError) {
    console.error("Network error:", err.message);      // 502
  } else if (err instanceof MawaqitParseError) {
    console.error("Parse error:", err.message);        // 500
  } else if (err instanceof MawaqitValidationError) {
    console.error("Bad input:", err.message);          // 400
  } else if (err instanceof MawaqitSearchError) {
    console.error("Search failed:", err.message);      // 502
  } else if (err instanceof MawaqitCountryError) {
    console.error("Country fetch failed:", err.message); // 502
  }
}
```

## Contributing
Feel free to [open an issue](https://github.com/roimee6/mawaqit/issues/new) or submit a pull request.