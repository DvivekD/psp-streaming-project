const fetch = require("node-fetch");

async function check() {
  try {
    console.log("Checking connection to httpbin.org...");
    const res = await fetch("https://httpbin.org/ip");
    const json = await res.json();
    console.log("Success! Your public IP is:", json.origin);
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

check();
