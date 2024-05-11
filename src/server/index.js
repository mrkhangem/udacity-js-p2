import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/apod", async (req, res) => {
  try {
    const image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    ).then((response) => response.json());
    res.send({ image });
  } catch (err) {
    console.error("error:", err);
  }
});

app.get("/manifests/:rover_name", async (req, res) => {
  try {
    const roverName = req.params.rover_name;
    const photoManifestUrl = `https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`;
    const photoManifest = await fetch(photoManifestUrl).then((response) =>
      response.json()
    );
    res.send(photoManifest);
  } catch (err) {
    console.error("error:", err);
  }
});

app.get("/rovers/:rover_name/photos", async (req, res) => {
  try {
    const roverName = req.params.rover_name;
    const queryString = Object.entries(req.query).reduce(
      (pre, [key, value]) => `${pre}&${key}=${value}`,
      ""
    );
    const roverPhotosUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?api_key=${process.env.API_KEY}${queryString}`;
    const [roverPhotos, { rover: { cameras } }] = await Promise.all([
      fetch(roverPhotosUrl).then((response) => response.json()),
      fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}?api_key=${process.env.API_KEY}`).then(
        (response) => response.json()
      ),
    ]);

    const roverPhotosPage = {
      ...roverPhotos,
      page: Number.parseInt(req.query.page),
      cameras,
    };
    res.send(roverPhotosPage);
  } catch (err) {
    console.error("error:", err);
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
