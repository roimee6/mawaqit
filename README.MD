# mawaqit
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme) ![npm](https://img.shields.io/npm/v/@max-xoo/mawaqit?color=green) [![npm download month](https://img.shields.io/npm/dm/@max-xoo/mawaqit.svg)](https://www.npmjs.com/package/@max-xoo/mawaqit)

A Node.js wrapper around [Mawaqit](https://mawaqit.net/), fetching mosque prayer times with built-in daily cache.

## Table of Contents
- [mawaqit](#mawaqit)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Usage](#usage)
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

```js
const mawaqit = require("@max-xoo/mawaqit");

// Get today's prayer times
const times = await mawaqit.getPrayerTimesOfTheDay("zawiya-tidjaniya-trappes");

// Get full year calendar
const calendar = await mawaqit.getCalendar("zawiya-tidjaniya-trappes");

// Get prayer times for a specific month (1-12)
const march = await mawaqit.getMonth("zawiya-tidjaniya-trappes", 3);

// Get iqama times for a specific month
const iqama = await mawaqit.getMonthIqama("zawiya-tidjaniya-trappes", 3);

// Get mosque info & services
const services = await mawaqit.getServices("zawiya-tidjaniya-trappes");

// Get announcements
const announcements = await mawaqit.getAnnouncements("zawiya-tidjaniya-trappes");

// Raw confData from mawaqit.net
const raw = await mawaqit.fetchMawaqit("zawiya-tidjaniya-trappes");
```

## Cache
Data is cached in memory and resets at **midnight** every day.  
You can manage the cache manually:

```js
mawaqit.clearCache();                          // Clear all entries
mawaqit.deleteCacheEntry("mosque-slug");       // Clear a specific mosque
const size = mawaqit.getCacheSize();           // Number of cached mosques
```

## Error Handling
```js
const {
  MawaqitNotFoundError,
  MawaqitParseError,
  MawaqitFetchError,
  MawaqitValidationError
} = require("@max-xoo/mawaqit");

try {
  const times = await mawaqit.getPrayerTimesOfTheDay("unknown-mosque");
} catch (err) {
  if (err instanceof MawaqitNotFoundError) {
    console.error("Mosque not found:", err.message);   // statusCode: 404
  } else if (err instanceof MawaqitFetchError) {
    console.error("Network error:", err.message);      // statusCode: 502
  } else if (err instanceof MawaqitParseError) {
    console.error("Parse error:", err.message);        // statusCode: 500
  } else if (err instanceof MawaqitValidationError) {
    console.error("Bad input:", err.message);          // statusCode: 400
  }
}
```

## Contributing
Feel free to [open an issue](https://github.com/roimee6/mawaqit/issues/new) or submit a pull request.