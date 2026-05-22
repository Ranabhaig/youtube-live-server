const WebSocket = require('ws');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 10000;

// YOUTUBE RTMP URL
const RTMP_URL = "rtmp://x.rtmp.youtube.com/live2";

// YOUR STREAM KEY
const STREAM_KEY = "qg6k-rm26-626f-7y1p-476a";

const wss = new WebSocket.Server({ port: PORT });

console.log("WebSocket Server Running");

wss.on('connection', (ws) => {

    console.log("Browser Connected");

    // FFmpeg process
    const ffmpeg = spawn('ffmpeg', [

        '-i', '-',

        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-maxrate', '3000k',
        '-bufsize', '6000k',

        '-pix_fmt', 'yuv420p',

        '-g', '50',

        '-c:a', 'aac',
        '-b:a', '128k',

        '-ar', '44100',

        '-f', 'flv',

        `${RTMP_URL}/${STREAM_KEY}`

    ]);

    ffmpeg.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    ffmpeg.on('close', () => {
        console.log("FFmpeg Closed");
    });

    ws.on('message', (msg) => {
        ffmpeg.stdin.write(msg);
    });

    ws.on('close', () => {

        console.log("Browser Disconnected");

        ffmpeg.stdin.end();

        ffmpeg.kill('SIGINT');
    });

});