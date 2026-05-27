const dns = require("dns");

const domains = ["animepahe.ru", "animepahe.com", "hianime.to", "gogoanime3.co"];

domains.forEach(domain => {
  dns.resolve4(domain, (err, addresses) => {
    if (err) {
      console.log(`Failed to resolve ${domain}:`, err.message);
    } else {
      console.log(`${domain} resolves to:`, addresses);
    }
  });
});
