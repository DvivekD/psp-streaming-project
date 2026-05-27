const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
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
const animesaturn = new ANIME.AnimeSaturn();

async function run() {
  try {
    console.log("Fetching anime info for Naruto-aaaaaaaaa...");
    const info = await animesaturn.fetchAnimeInfo("Naruto-aaaaaaaaa");
    console.log(`Total episodes found: ${info.episodes.length}`);
    console.log("First 3 episodes:", JSON.stringify(info.episodes.slice(0, 3), null, 2));

    if (info.episodes.length > 0) {
      const firstEp = info.episodes[0];
      console.log(`\nFetching streaming sources for first episode (ID: ${firstEp.id})...`);
      const sources = await animesaturn.fetchEpisodeSources(firstEp.id);
      console.log("Sources:", JSON.stringify(sources, null, 2));
    }
  } catch (err) {
    console.error("AnimeSaturn test failed:", err);
  }
}

run();
