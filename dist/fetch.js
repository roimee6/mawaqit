const axios = require("axios");
const { load } = require("cheerio");
const { getFromCache, setToCache } = require("./cache");
const {
    MawaqitNotFoundError,
    MawaqitParseError,
    MawaqitFetchError,
    MawaqitSearchError,
    MawaqitCountryError,
} = require("./errors");

const CONF_DATA_REGEX = /(?:var|let)\s+confData\s*=\s*(.*?);/s;
const BASE_API = "https://mawaqit.net/api/2.0";
const MAP_CACHE_TTL = 6 * 60 * 60 * 1000; // 6h
const SEARCH_CACHE_TTL = 30 * 60 * 1000; // 30min

async function fetchMawaqit(masjidId) {
    const cached = getFromCache(`conf:${masjidId}`);
    if (cached) return cached;

    const url = `https://mawaqit.net/fr/${masjidId}`;
    let response;

    try {
        response = await axios.get(url);
    } catch (err) {
        const status = err.response?.status;
        if (status === 404) throw new MawaqitNotFoundError(masjidId);
        throw new MawaqitFetchError(url);
    }

    const $ = load(response.data);
    let confData = null;

    $("script").each((_, el) => {
        if (confData) return;
        const content = $(el).html();
        if (content && CONF_DATA_REGEX.test(content)) {
            const match = content.match(CONF_DATA_REGEX);
            if (match) {
                try {
                    confData = JSON.parse(match[1]);
                } catch {
                    throw new MawaqitParseError(masjidId);
                }
            }
        }
    });

    if (!confData) throw new MawaqitParseError(masjidId);

    setToCache(`conf:${masjidId}`, confData);
    return confData;
}

async function fetchMosquesByCountry(countryCode) {
    const code = countryCode.toUpperCase();
    const cacheKey = `map:${code}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${BASE_API}/mosque/map/${code}`;

    try {
        const { data } = await axios.get(url);
        setToCache(cacheKey, data, MAP_CACHE_TTL);
        return data;
    } catch {
        throw new MawaqitCountryError(code);
    }
}

async function fetchSearchMosques(word, fields) {
    const cacheKey = `search:${word}:${fields || ""}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const params = { word };
    if (fields) params.fields = fields;

    const url = `${BASE_API}/mosque/search`;

    try {
        const { data } = await axios.get(url, { params });
        setToCache(cacheKey, data, SEARCH_CACHE_TTL);
        return data;
    } catch {
        throw new MawaqitSearchError(word);
    }
}

module.exports = {
    fetchMawaqit,
    fetchMosquesByCountry,
    fetchSearchMosques,
};