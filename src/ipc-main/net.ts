import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import https from "node:https";
import { net } from "electron";

/**
 * Automatic management of system proxy configuration, support of the wpad protocol and proxy pac configuration files.
 * Automatic tunneling of HTTPS requests.
 * Support for authenticating proxies using basic, digest, NTLM, Kerberos or negotiate authentication schemes.
 * Support for traffic monitoring proxies: Fiddler-like proxies used for access control and monitoring.
 * @param {string} url
 * @returns Observable
 */
export function httpGet(url: string) {
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

export function nodeHttps(url: string) {
  return new Observable<string>((subscriber) => {
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
export function httpsImageBase64(url: string) {
  return nodeHttps(url).pipe(
    map((chunks) => {
      const base64Data = Buffer.from(chunks).toString("base64");
      const url = `data:image/svg+xml;base64,${base64Data}`;
      return url;
    })
  );
}
