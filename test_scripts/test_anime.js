const dns = require("dns");
// Override DNS to bypass ISP hijacking
dns.setServers(["8.8.8.8", "1.1.1.1", "208.67.222.222"]);
const originalLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  let opt = {};
  let cb = callback;
  if (typeof options === "function") {
    cb = options;
  } else {
    opt = options || {};
  }

  if (opt.all) {
    dns.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        const results = addresses.map(addr => ({ address: addr, family: 4 }));
        return cb(null, results);
      }
      originalLookup(hostname, opt, cb);
    });
  } else {
    dns.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        return cb(null, addresses[0], 4);
      }
      originalLookup(hostname, opt, cb);
    });
  }
};

const { ANIME } = require("@consumet/extensions");

async function testAnimePahe() {
  try {
    console.log("--- Testing AnimePahe ---");
    const animepahe = new ANIME.AnimePahe();
    console.log("Searching for 'naruto' in AnimePahe...");
    const searchResults = await animepahe.search("naruto");
    console.log("Search Results:", JSON.stringify(searchResults.results.slice(0, 3), null, 2));

    if (searchResults.results.length > 0) {
      const bestMatch = searchResults.results[0];
      console.log(`\nFetching details for: ${bestMatch.title} (${bestMatch.id})...`);
      const details = await animepahe.fetchAnimeInfo(bestMatch.id);
      console.log(`Total episodes: ${details.episodes.length}`);
      console.log("First 3 Episodes:", JSON.stringify(details.episodes.slice(0, 3), null, 2));

      if (details.episodes.length > 0) {
        const ep = details.episodes[0];
        console.log(`\nFetching streaming sources for episode: ${ep.id}...`);
        const sources = await animepahe.fetchEpisodeSources(ep.id);
        console.log("Sources:", JSON.stringify(sources, null, 2));
      }
    }
  } catch (err) {
    console.error("AnimePahe test failed:", err.message);
  }
}

async function testHianime() {
  try {
    console.log("\n--- Testing Hianime ---");
    const hianime = new ANIME.Hianime();
    console.log("Searching for 'naruto' in Hianime...");
    const searchResults = await hianime.search("naruto");
    console.log("Search Results:", JSON.stringify(searchResults.results.slice(0, 3), null, 2));

    if (searchResults.results.length > 0) {
      const bestMatch = searchResults.results[0];
      console.log(`\nFetching details for: ${bestMatch.title} (${bestMatch.id})...`);
      const details = await hianime.fetchAnimeInfo(bestMatch.id);
      console.log(`Total episodes: ${details.episodes.length}`);
      console.log("First 3 Episodes:", JSON.stringify(details.episodes.slice(0, 3), null, 2));

      if (details.episodes.length > 0) {
        const ep = details.episodes[0];
        console.log(`\nFetching streaming sources for episode: ${ep.id}...`);
        const sources = await hianime.fetchEpisodeSources(ep.id);
        console.log("Sources:", JSON.stringify(sources, null, 2));
      }
    }
  } catch (err) {
    console.error("Hianime test failed:", err.message);
  }
}

async function run() {
  await testAnimePahe();
  await testHianime();
}

run();
