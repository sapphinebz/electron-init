const { net } = require("electron");
const { Observable } = require("rxjs");
const { map } = require("rxjs/operators");
const https = require("https");

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

function nodeHttps(url) {
  return new Observable((subscriber) => {
    const abortController = new AbortController();
    https
      .get(
        url,
        { signal: abortController.signal, method: "GET" },
        (response) => {
          let chunks = "";
          response.on("data", (chunk) => {
            chunks += chunk;
          });
          response.on("end", () => {
            subscriber.next(chunks);
            subscriber.complete();
          });
        }
      )
      .on("error", (error) => {
        subscriber.error(error);
      });

    return {
      unsubscribe: () => {
        abortController.abort();
      },
    };
  });
}
/**
 *
 * @param {string} url
 * @returns Observable<string>
 */
function httpsImageBase64(url) {
  return nodeHttps(url).pipe(
    map((chunks) => {
      const base64Data = Buffer.from(chunks).toString("base64");
      const url = `data:image/svg+xml;base64,${base64Data}`;
      return url;
    })
  );
}

module.exports = {
  httpGet,
  nodeHttps,
  httpsImageBase64,
};
