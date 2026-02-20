const {
    fetchMawaqit
} = require("./fetch");
const {
    MawaqitValidationError
} = require("./errors");

async function getPrayerTimesOfTheDay(masjidId) {
    const {
        times,
        shuruq
    } = await fetchMawaqit(masjidId);
    return {
        fajr: times[0],
        sunrise: shuruq,
        dohr: times[1],
        asr: times[2],
        maghreb: times[3],
        icha: times[4],
    };
}

async function getCalendar(masjidId) {
    const {
        calendar
    } = await fetchMawaqit(masjidId);
    return calendar;
}

async function getMonth(masjidId, monthNumber) {
    if (monthNumber < 1 || monthNumber > 12) {
        throw new MawaqitValidationError("Month number should be between 1 and 12");
    }
    const {
        calendar
    } = await fetchMawaqit(masjidId);
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

async function getMonthIqama(masjidId, monthNumber) {
    if (monthNumber < 1 || monthNumber > 12) {
        throw new MawaqitValidationError("Month number should be between 1 and 12");
    }
    const {
        iqamaCalendar
    } = await fetchMawaqit(masjidId);
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
    const {
        announcements
    } = await fetchMawaqit(masjidId);
    return announcements ?? [];
}

async function getServices(masjidId) {
    const confData = await fetchMawaqit(masjidId);
    return {
        name: confData.name,
        label: confData.label,
        localisation: confData.localisation,
        phone: confData.phone,
        email: confData.email,
        site: confData.site,
        mosqueeType: confData.mosqueeType,
        association: confData.association,
    };
}

module.exports = {
    getPrayerTimesOfTheDay,
    getCalendar,
    getMonth,
    getMonthIqama,
    getAnnouncements,
    getServices,
};