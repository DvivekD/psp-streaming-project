const fetch = require("node-fetch");

async function verify() {
  console.log("--- Verifying Server Endpoints ---");
  try {
    console.log("1. Querying anime search for 'naruto'...");
    const searchRes = await fetch("http://localhost:8081/anime/api/videos?q=naruto&start-index=1&max-results=20");
    console.log("Search Status:", searchRes.status);
    const searchXml = await searchRes.text();
    console.log("Search XML (First 600 chars):\n", searchXml.substring(0, 600));

    console.log("\n2. Querying thumbnail proxy...");
    const thumbRes = await fetch("http://localhost:8081/anime/thumb?img=wV47Cdt.png");
    console.log("Thumbnail Status:", thumbRes.status);
    console.log("Thumbnail Content-Type:", thumbRes.headers.get("content-type"));

    console.log("\n3. Querying anime play endpoint (transcode)...");
    console.log("This will trigger a 10s transcode and should redirect to the FLV file.");
    const startTime = Date.now();
    const playRes = await fetch("http://localhost:8081/anime/play?episode_id=Naruto-ep-1", {
      redirect: "manual"
    });
    console.log("Play Status:", playRes.status);
    console.log("Redirect Location:", playRes.headers.get("location"));
    console.log(`Time taken: ${(Date.now() - startTime) / 1000}s`);

    if (playRes.headers.get("location")) {
      const flvUrl = "http://localhost:8081" + playRes.headers.get("location").replace("http://localhost:8081", "");
      console.log(`\n4. Verifying transcoded FLV asset at: ${flvUrl}`);
      const flvRes = await fetch(flvUrl);
      console.log("FLV Asset Status:", flvRes.status);
      console.log("FLV Asset Size:", flvRes.headers.get("content-length"), "bytes");
    }
  } catch (err) {
    console.error("Verification failed:", err);
  }
}

verify();
