const app  = require('electron').app;
const http = require('http');
const url  = require('url');
const fs   = require('fs');
const path = require('path');

var dlStatus = {
	progress: 0,
	total: 0,
	isDownloading: false
};

var req;

function download(rawUrl, port, file, progress, callback, mainWindow) {
	var parsedUrl = url.parse(rawUrl);
	var hostname  = parsedUrl.hostname;
	var pathname  = parsedUrl.pathname;
	var filename  = file || pathname.split('/').pop();

	var f = fs.createWriteStream(filename, { 'flags': 'w' });
	f.on('open', function(fd) {
		var options = {
			method: 'GET',
			host: hostname,
			path: pathname,
			port: port
		};

		var buffer = '';

		req = http.request(options, function(res) {
			if (res.statusCode !== 200) {
				return mainWindow.webContents.send('error', `status: ${res.statusCode}`);
			}

			dlStatus.progress = 0;
			dlStatus.total = res.headers['content-length'];
			console.log('Starting download...');
			console.log(`File size: ${ dlStatus.total } bytes`);

			res.on('data', function(chunk) {
				dlStatus.isDownloading = true;
				f.write(chunk, encoding='binary');
				dlStatus.progress += chunk.length;
				progress && progress(dlStatus);
			});

			res.on('end', function() {
				dlStatus.isDownloading = false;
				progress && progress(dlStatus);
				console.log('Download complete!');
				f.end();
				callback && callback();
			});
		});

		req.on('error', function(e) {
			console.error(`problem with request: ${e.message}`);
			mainWindow.webContents.send('error', `Problem with request: ${e.message}`);
		});

		req.end();
	});
}

module.exports = {
	download: function(options, progress, callback, mainWindow) {
		return download(options.url, options.port, options.filename || null, progress, callback, mainWindow);
	},

	downloadStatus: function() {
		return dlStatus;
	},

	abort: function() {
		if (req && dlStatus.isDownloading) req.abort();
	},

	isDownloading: function() {
		return dlStatus.isDownloading;
	}
};