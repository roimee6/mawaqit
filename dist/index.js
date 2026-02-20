const {
    fetchMawaqit
} = require("./fetch");

const {
    getPrayerTimesOfTheDay,
    getCalendar,
    getMonth,
    getMonthIqama,
    getAnnouncements,
    getServices,
} = require("./mawaqit");

const {
    clearCache,
    deleteCacheEntry,
    getCacheSize,
} = require("./cache");

const {
    MawaqitError,
    MawaqitNotFoundError,
    MawaqitParseError,
    MawaqitFetchError,
    MawaqitValidationError,
} = require("./errors");

module.exports = {
    fetchMawaqit,

    getPrayerTimesOfTheDay,
    getCalendar,
    getMonth,
    getMonthIqama,

    getAnnouncements,
    getServices,

    clearCache,
    deleteCacheEntry,
    getCacheSize,

    MawaqitError,
    MawaqitNotFoundError,
    MawaqitParseError,
    MawaqitFetchError,
    MawaqitValidationError,
};