import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";
import path from "path";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Listen on all network interfaces
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(
    path.join(__dirname, "certificates/localhost+3-key.pem")
  ),
  cert: fs.readFileSync(
    path.join(__dirname, "certificates/localhost+3.pem")
  ),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname}:${port}`);
    console.log(`> Local:    https://localhost:${port}`);
    console.log(`> Network:  https://192.168.1.10:${port}`);
  });
});