import fs from "node:fs";
import path from "node:path";
import { Observable } from "rxjs";

export function readAssetFile(relativePath: string) {
  return new Observable<string>((subscriber) => {
    const filePath = path.resolve(__dirname, `assets`, relativePath);
    const readStream = fs.createReadStream(filePath, {
      encoding: "utf8",
    });

    subscriber.add(readStream.close.bind(readStream));

    let chunks: string = "";
    // let buffer = Buffer.alloc(0);

    readStream.on("data", (chunk) => {
      chunks += chunk;
      // buffer = Buffer.concat([buffer, chunk]);
    });
    readStream.once("end", () => {
      subscriber.next(chunks);
      subscriber.complete();
    });

    readStream.once("error", (err) => {
      subscriber.error(err);
    });
  });
}
