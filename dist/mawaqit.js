const { fetchMawaqit, fetchMosquesByCountry, fetchSearchMosques } = require("./fetch");
const { MawaqitValidationError } = require("./errors");

async function getPrayerTimesOfTheDay(masjidId) {
    const { times, shuruq } = await fetchMawaqit(masjidId);
    return {
        fajr: times[0],
        sunrise: shuruq,
        dohr: times[1],
        asr: times[2],
        maghreb: times[3],
        icha: times[4],
    };
}

async function getIqamaTimes(masjidId) {
    const { iqamaCalendar, iqamaEnabled } = await fetchMawaqit(masjidId);
    if (!iqamaEnabled) return null;
    const now = new Date();
    const month = iqamaCalendar[now.getMonth()];
    const day = Object.values(month)[now.getDate() - 1];
    if (!day) return null;
    return {
        fajr: day[0],
        dohr: day[1],
        asr: day[2],
        maghreb: day[3],
        icha: day[4],
    };
}

async function getNextPrayer(masjidId) {
    const times = await getPrayerTimesOfTheDay(masjidId);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const names = ["fajr", "sunrise", "dohr", "asr", "maghreb", "icha"];

    for (const name of names) {
        const t = times[name];
        if (!t) continue;
        const [h, m] = t.split(":").map(Number);
        if (h * 60 + m > nowMinutes) {
            return { name, time: t };
        }
    }
    return { name: "fajr", time: times.fajr, tomorrow: true };
}

async function getJumuaTimes(masjidId) {
    const conf = await fetchMawaqit(masjidId);
    const result = { jumua: conf.jumpiua || conf.jumua || null };
    if (conf.jumua2) result.jumua2 = conf.jumua2;
    if (conf.jumua3) result.jumua3 = conf.jumua3;
    result.jumuaAsDuhr = conf.jumuaAsDuhr || false;
    return result;
}

async function getCalendar(masjidId) {
    const { calendar } = await fetchMawaqit(masjidId);
    return calendar;
}

async function getMonth(masjidId, monthNumber) {
    if (monthNumber < 1 || monthNumber > 12) {
        throw new MawaqitValidationError("Month number should be between 1 and 12");
    }
    const { calendar } = await fetchMawaqit(masjidId);
    const month = calendar[monthNumber - 1];
    return Object.values(month).map((prayer) => ({
        fajr: prayer[0],
        sunrise: prayer[1],
        dohr: prayer[2],
        asr: prayer[3],
        maghreb: prayer[4],
        icha: prayer[5],
    }));
}

async function getDay(masjidId, monthNumber, dayNumber) {
    if (monthNumber < 1 || monthNumber > 12) {
        throw new MawaqitValidationError("Month number should be between 1 and 12");
    }
    if (dayNumber < 1 || dayNumber > 31) {
        throw new MawaqitValidationError("Day number should be between 1 and 31");
    }
    const { calendar } = await fetchMawaqit(masjidId);
    const month = calendar[monthNumber - 1];
    const days = Object.values(month);
    if (dayNumber > days.length) {
        throw new MawaqitValidationError(`Day ${dayNumber} does not exist in month ${monthNumber}`);
    }
    const prayer = days[dayNumber - 1];
    return {
        fajr: prayer[0],
        sunrise: prayer[1],
        dohr: prayer[2],
        asr: prayer[3],
        maghreb: prayer[4],
        icha: prayer[5],
    };
}

async function getMonthIqama(masjidId, monthNumber) {
    if (monthNumber < 1 || monthNumber > 12) {
        throw new MawaqitValidationError("Month number should be between 1 and 12");
    }
    const { iqamaCalendar } = await fetchMawaqit(masjidId);
    const month = iqamaCalendar[monthNumber - 1];
    return Object.values(month).map((iqama) => ({
        fajr: iqama[0],
        dohr: iqama[1],
        asr: iqama[2],
        maghreb: iqama[3],
        icha: iqama[4],
    }));
}

async function getAnnouncements(masjidId) {
    const { announcements } = await fetchMawaqit(masjidId);
    return announcements ?? [];
}

async function getServices(masjidId) {
    const conf = await fetchMawaqit(masjidId);
    return {
        name: conf.name,
        label: conf.label,
        localisation: conf.localisation,
        phone: conf.phone,
        email: conf.email,
        site: conf.site,
        mosqueeType: conf.mosqueeType,
        association: conf.association,
    };
}

async function getMosqueInfo(masjidId) {
    const conf = await fetchMawaqit(masjidId);
    return {
        uuid: conf.uuid,
        name: conf.name,
        label: conf.label,
        slug: masjidId,
        localisation: conf.localisation,
        phone: conf.phone,
        email: conf.email,
        site: conf.site,
        mosqueeType: conf.mosqueeType,
        association: conf.association,
        image: conf.image1 || conf.image || null,
        womenSpace: conf.womenSpace ?? null,
        janazaPrayer: conf.janazaPrayer ?? null,
        aidPrayer: conf.aidPrayer ?? null,
        childrenCourses: conf.childrenCourses ?? null,
        adultCourses: conf.adultCourses ?? null,
        ramadanMeal: conf.ramadanMeal ?? null,
        handicapAccessibility: conf.handicapAccessibility ?? null,
        ablutions: conf.ablutions ?? null,
        parking: conf.parking ?? null,
        iqamaEnabled: conf.iqamaEnabled ?? false,
        longitude: conf.longitude ?? null,
        latitude: conf.latitude ?? null,
    };
}

async function getFlashMessage(masjidId) {
    const { flash } = await fetchMawaqit(masjidId);
    return flash ?? null;
}

async function getRawConfData(masjidId) {
    return await fetchMawaqit(masjidId);
}

// ---- Country / Map ----

async function getMosquesByCountry(countryCode) {
    if (!countryCode || countryCode.length !== 2) {
        throw new MawaqitValidationError("Country code must be a 2-letter ISO code (e.g. FR, EN, DE)");
    }
    return await fetchMosquesByCountry(countryCode);
}

async function getMosquesByCountryCount(countryCode) {
    const mosques = await getMosquesByCountry(countryCode);
    return mosques.length;
}

async function getMosquesByCity(countryCode, city) {
    const mosques = await getMosquesByCountry(countryCode);
    const lower = city.toLowerCase();
    return mosques.filter((m) => m.city && m.city.toLowerCase() === lower);
}

async function getMosquesByZipcode(countryCode, zipcode) {
    const mosques = await getMosquesByCountry(countryCode);
    return mosques.filter((m) => m.zipcode === zipcode);
}

async function getMosquesByName(countryCode, name) {
    const mosques = await getMosquesByCountry(countryCode);
    const lower = name.toLowerCase();
    return mosques.filter((m) => m.name && m.name.toLowerCase().includes(lower));
}

async function getMosquesByRadius(countryCode, lat, lng, radiusKm) {
    if (typeof lat !== "number" || typeof lng !== "number" || typeof radiusKm !== "number") {
        throw new MawaqitValidationError("lat, lng and radiusKm must be numbers");
    }
    const mosques = await getMosquesByCountry(countryCode);
    return mosques.filter((m) => {
        if (!m.lat || !m.lng) return false;
        const dist = haversine(lat, lng, m.lat, m.lng);
        return dist <= radiusKm;
    }).map((m) => ({
        ...m,
        distance: Math.round(haversine(lat, lng, m.lat, m.lng) * 100) / 100,
    })).sort((a, b) => a.distance - b.distance);
}

async function getNearestMosque(countryCode, lat, lng) {
    const mosques = await getMosquesByRadius(countryCode, lat, lng, 50000);
    return mosques[0] || null;
}

async function getNearestMosques(countryCode, lat, lng, limit = 5) {
    const mosques = await getMosquesByRadius(countryCode, lat, lng, 50000);
    return mosques.slice(0, limit);
}

// ---- Search ----

async function searchMosques(word, fields) {
    if (!word || word.trim().length === 0) {
        throw new MawaqitValidationError("Search word cannot be empty");
    }
    return await fetchSearchMosques(word.trim(), fields);
}

async function searchByName(name) {
    return await searchMosques(name, "slug,label");
}

async function searchByZipcode(zipcode) {
    return await searchMosques(zipcode, "slug,label");
}

async function searchByCity(city) {
    return await searchMosques(city, "slug,label");
}

async function searchFull(word) {
    return await searchMosques(word);
}

async function searchWithTimes(word) {
    const results = await searchMosques(word);
    return results.map((m) => ({
        slug: m.slug,
        name: m.name || m.label,
        localisation: m.localisation,
        times: m.times ? {
            fajr: m.times[0],
            sunrise: m.times[1],
            dohr: m.times[2],
            asr: m.times[3],
            maghreb: m.times[4],
            icha: m.times[5],
        } : null,
        iqama: m.iqama || null,
        jumua: m.jumua || null,
    }));
}

// ---- Bulk operations ----

async function getAllCountryMosquesWithTimes(countryCode) {
    const mosques = await getMosquesByCountry(countryCode);
    const results = [];
    for (const m of mosques) {
        try {
            const times = await getPrayerTimesOfTheDay(m.slug);
            results.push({ ...m, times });
        } catch {
            results.push({ ...m, times: null });
        }
    }
    return results;
}

async function getMultipleMosqueTimes(slugs) {
    if (!Array.isArray(slugs)) {
        throw new MawaqitValidationError("slugs must be an array");
    }
    const results = {};
    for (const slug of slugs) {
        try {
            results[slug] = await getPrayerTimesOfTheDay(slug);
        } catch (err) {
            results[slug] = { error: err.message };
        }
    }
    return results;
}

// ---- Utils ----

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = {
    getPrayerTimesOfTheDay,
    getIqamaTimes,
    getNextPrayer,
    getJumuaTimes,
    getCalendar,
    getMonth,
    getDay,
    getMonthIqama,
    getAnnouncements,
    getServices,
    getMosqueInfo,
    getFlashMessage,
    getRawConfData,

    getMosquesByCountry,
    getMosquesByCountryCount,
    getMosquesByCity,
    getMosquesByZipcode,
    getMosquesByName,
    getMosquesByRadius,
    getNearestMosque,
    getNearestMosques,

    searchMosques,
    searchByName,
    searchByZipcode,
    searchByCity,
    searchFull,
    searchWithTimes,

    getAllCountryMosquesWithTimes,
    getMultipleMosqueTimes,
};