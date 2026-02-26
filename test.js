const mawaqit = require("./dist/index");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const SLUG = "asmc78-la-celle-saint-cloud";
const COUNTRY = "FR";

const tests = [
    { name: "getPrayerTimesOfTheDay", fn: () => mawaqit.getPrayerTimesOfTheDay(SLUG) },
    { name: "getIqamaTimes", fn: () => mawaqit.getIqamaTimes(SLUG) },
    { name: "getNextPrayer", fn: () => mawaqit.getNextPrayer(SLUG) },
    { name: "getJumuaTimes", fn: () => mawaqit.getJumuaTimes(SLUG) },
    { name: "getCalendar", fn: () => mawaqit.getCalendar(SLUG) },
    { name: "getMonth (3)", fn: () => mawaqit.getMonth(SLUG, 3) },
    { name: "getDay (3, 15)", fn: () => mawaqit.getDay(SLUG, 3, 15) },
    { name: "getMonthIqama (3)", fn: () => mawaqit.getMonthIqama(SLUG, 3) },
    { name: "getAnnouncements", fn: () => mawaqit.getAnnouncements(SLUG) },
    { name: "getServices", fn: () => mawaqit.getServices(SLUG) },
    { name: "getMosqueInfo", fn: () => mawaqit.getMosqueInfo(SLUG) },
    { name: "getFlashMessage", fn: () => mawaqit.getFlashMessage(SLUG) },
    { name: "getRawConfData", fn: () => mawaqit.getRawConfData(SLUG) },
    { name: "getMosquesByCountry (FR)", fn: () => mawaqit.getMosquesByCountry(COUNTRY) },
    { name: "getMosquesByCountryCount (FR)", fn: () => mawaqit.getMosquesByCountryCount(COUNTRY) },
    { name: "getMosquesByCity (FR, Paris)", fn: () => mawaqit.getMosquesByCity(COUNTRY, "Paris") },
    { name: "getMosquesByZipcode (FR, 78000)", fn: () => mawaqit.getMosquesByZipcode(COUNTRY, "78000") },
    { name: "getMosquesByName (FR, essalam)", fn: () => mawaqit.getMosquesByName(COUNTRY, "essalam") },
    { name: "getMosquesByRadius (FR, 48.85, 2.35, 5km)", fn: () => mawaqit.getMosquesByRadius(COUNTRY, 48.8566, 2.3522, 5) },
    { name: "getNearestMosque (FR, 48.85, 2.35)", fn: () => mawaqit.getNearestMosque(COUNTRY, 48.8566, 2.3522) },
    { name: "getNearestMosques (FR, 48.85, 2.35, 3)", fn: () => mawaqit.getNearestMosques(COUNTRY, 48.8566, 2.3522, 3) },
    { name: "searchByName (versailles)", fn: () => mawaqit.searchByName("versailles") },
    { name: "searchByZipcode (78000)", fn: () => mawaqit.searchByZipcode("78000") },
    { name: "searchByCity (Trappes)", fn: () => mawaqit.searchByCity("Trappes") },
    { name: "searchFull (versailles)", fn: () => mawaqit.searchFull("versailles") },
    { name: "searchWithTimes (versailles)", fn: () => mawaqit.searchWithTimes("versailles") },
    { name: "getMultipleMosqueTimes", fn: () => mawaqit.getMultipleMosqueTimes([SLUG, "mosquee-de-versailles-versailles-78000-france"]) },
    { name: "getCacheSize", fn: async () => mawaqit.getCacheSize() },
    { name: "getCacheKeys", fn: async () => mawaqit.getCacheKeys() },
];

function printMenu() {
    console.log("\n========== MAWAQIT CLI TEST ==========");
    console.log(`Slug: ${SLUG} | Country: ${COUNTRY}\n`);
    tests.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2, " ")}. ${t.name}`));
    console.log(`\n   a. Run ALL tests`);
    console.log(`   c. Clear cache`);
    console.log(`   q. Quit`);
    console.log("=======================================\n");
}

function truncate(obj) {
    const str = JSON.stringify(obj, null, 2);
    if (str.length > 2000) return str.slice(0, 2000) + "\n... (truncated)";
    return str;
}

async function runTest(index) {
    const t = tests[index];
    const start = Date.now();
    try {
        const result = await t.fn();
        const ms = Date.now() - start;
        console.log(`\n✅ ${t.name} (${ms}ms)`);
        console.log(truncate(result));
    } catch (err) {
        const ms = Date.now() - start;
        console.log(`\n❌ ${t.name} (${ms}ms)`);
        console.log(`   ${err.name}: ${err.message}`);
    }
}

async function runAll() {
    console.log("\n🚀 Running all tests...\n");
    let pass = 0;
    let fail = 0;
    const start = Date.now();
    for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        const s = Date.now();
        try {
            const result = await t.fn();
            const ms = Date.now() - s;
            const preview = JSON.stringify(result);
            const short = preview.length > 100 ? preview.slice(0, 100) + "..." : preview;
            console.log(`  ✅ ${t.name} (${ms}ms) → ${short}`);
            pass++;
        } catch (err) {
            const ms = Date.now() - s;
            console.log(`  ❌ ${t.name} (${ms}ms) → ${err.name}: ${err.message}`);
            fail++;
        }
    }
    const total = Date.now() - start;
    console.log(`\n📊 ${pass} passed, ${fail} failed (${total}ms total)`);
}

async function main() {
    while (true) {
        printMenu();
        const input = (await ask("Choice: ")).trim().toLowerCase();

        if (input === "q") {
            console.log("👋");
            rl.close();
            break;
        }

        if (input === "a") {
            await runAll();
            continue;
        }

        if (input === "c") {
            mawaqit.clearCache();
            console.log("\n🗑️  Cache cleared");
            continue;
        }

        const num = parseInt(input);
        if (num >= 1 && num <= tests.length) {
            await runTest(num - 1);
        } else {
            console.log("❓ Invalid choice");
        }
    }
}

main();