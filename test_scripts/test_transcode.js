const { spawn } = require("child_process");
const path = require("path");

const m3u8Url = "https://srv17.denwa.streampeaker.org/DDL/ANIME/Naruto/001/playlist.m3u8";
const referer = "https://www.animesaturn.cx/watch?file=mT8faurDdcsX-";
const userAgent = "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0";
const outputFile = path.join(__dirname, "test_output.flv");

const headers = `Referer: ${referer}\r\nUser-Agent: ${userAgent}\r\n`;

const args = [
  "-y",
  "-headers", headers,
  "-i", m3u8Url,
  "-vcodec", "flv1",
  "-b:v", "500k",
  "-s", "480x272",
  "-r", "24",
  "-acodec", "libmp3lame",
  "-ar", "44100",
  "-ac", "2",
  "-ab", "96k",
  "-t", "10",
  outputFile
];

console.log("Spawning ffmpeg with arguments:", args);

const ffmpeg = spawn("ffmpeg", args);

ffmpeg.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

ffmpeg.stderr.on("data", (data) => {
  // ffmpeg prints progress and logs to stderr
  console.log(`stderr: ${data.toString()}`);
});

ffmpeg.on("close", (code) => {
  console.log(`ffmpeg process exited with code ${code}`);
  if (code === 0) {
    console.log("Transcoding succeeded! FLV file created at:", outputFile);
  } else {
    console.log("Transcoding failed.");
  }
});
