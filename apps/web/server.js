const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const noCache = require('nocache');
const featurePolicy = require('feature-policy');
require('dotenv').config();
const port = process.env.PORT || 3000;
// var expressStaticGzip = require("compression");
const expressStaticGzip = require('express-static-gzip');
//
// app.use(
//     expressStaticGzip(path.join(__dirname, 'build'), {
//         enableBrotli: false, // only if you have brotli files too
//     })
// );
// app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(
    featurePolicy({
        features: {
            fullscreen: ["'self'"],
            camera: ["'self'"],
            payment: ["'self'"],
            microphone: ["'self'"],
        },
    })
);

app.use(noCache());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
http.createServer(app).listen(port, () => {
    console.log(`Running frontend from express in http://localhost:${port}...`)
});