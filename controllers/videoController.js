const fs = require("fs");
const Movie = require("../models/video");

exports.topVideos = (req, res, next) => {
  Movie.find()
    .select("-fileName")
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

exports.getWatchVideo = (req, res, next) => {
  const movie_id = req.params.id;

  Movie.findById(movie_id)
    .then((movie) => {
      const path = `s3_videos/${movie.fileName}`;
      const stat = fs.statSync(path);
      const fileSize = stat.size;
      const range = req.headers.range;

      console.log(range);

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const file = fs.createReadStream(path, { start, end });

        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Range": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        file.pipe(res);
      }
    })
    .catch((err) => {
      res.status(404).json("Movie Does not exist");
    });

  // if (req.userId) {

  // } else {
  //   // const head = {
  //   //   "Content-Length": fileSize,
  //   //   "Content-Type": "video/mp4",
  //   // };
  //   // res.writeHead(200, head);
  //   // fs.createReadStream(path).pipe(res);
  // }
  // } else {
  //   res.status(403).json("access denied!");
  // }
};