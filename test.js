const mawaqit = require("./dist/index");

(async() => {
  const a = await mawaqit.getPrayerTimesOfTheDay("asmc78-la-celle-saint-cloud");

  console.log(a);
})();
