const dns = require("dns");
const fetch = require("node-fetch");

// Configure Node to use Google and Cloudflare DNS
dns.setServers(["8.8.8.8", "1.1.1.1", "208.67.222.222"]);

// Robust override of global dns.lookup
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

async function test() {
  console.log("Resolving hianime.to after DNS override...");
  dns.lookup("hianime.to", (err, address) => {
    if (err) {
      console.error("Lookup failed:", err.message);
    } else {
      console.log("hianime.to now resolves to:", address);
    }
  });

  try {
    console.log("Fetching hianime.to home page...");
    const res = await fetch("https://hianime.to", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("HTTP status code:", res.status);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

test();
