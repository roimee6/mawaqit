const axios = require("axios");

const {
    load
} = require("cheerio");
const {
    getFromCache,
    setToCache
} = require("./cache");

const {
    MawaqitNotFoundError,
    MawaqitParseError,
    MawaqitFetchError,
} = require("./errors");

const CONF_DATA_REGEX = /(?:var|let)\s+confData\s*=\s*(.*?);/s;

async function fetchMawaqit(masjidId) {
    const cached = getFromCache(masjidId);
    if (cached) {
        return cached;
    }

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
        if (confData) return; // already found
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

    if (!confData) {
        throw new MawaqitParseError(masjidId);
    }

    setToCache(masjidId, confData);
    return confData;
}

module.exports = {
    fetchMawaqit
};