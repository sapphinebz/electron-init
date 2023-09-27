const { net } = require("electron");
const { Observable } = require("rxjs");

/**
 * Automatic management of system proxy configuration, support of the wpad protocol and proxy pac configuration files.
 * Automatic tunneling of HTTPS requests.
 * Support for authenticating proxies using basic, digest, NTLM, Kerberos or negotiate authentication schemes.
 * Support for traffic monitoring proxies: Fiddler-like proxies used for access control and monitoring.
 * @param {string} url
 * @returns Observable
 */
function httpGet(url) {
  return new Observable((subscriber) => {
    const request = net.request({
      url,
      method: "GET",
    });
    request.on("response", (response) => {
      // console.log(`STATUS: ${response.statusCode}`)
      // console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
      let chunks = "";
      response.on("data", (chunk) => {
        chunks += chunk;
      });
      response.on("end", () => {
        subscriber.next(JSON.stringify(chunks));
        subscriber.complete();
      });
    });
    request.end();
  });
}

module.exports = {
  httpGet,
};
