/*
* @Author: egmfilho
* @Date:   2017-06-06 09:08:17
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-24 13:39:16
*/

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const path = require('path');
const url = require('url');
const downloader = require('./downloader.js');
// require('electron-debug')({showDevTools: true, enabled: true});

let mainWindow;


ipcMain.on('begin-download', function(event, arg) {
	var config = require('./config.json'),
		status = downloader.downloadStatus;

	if (config) {
		event.sender.send('download');

		downloader.download({
			url: config.url, 
			port: config.port || 80,
			filename: config.filename
		}, function(s) {
			event.sender.send('download-progress', {
				progress: s.progress,
				total: s.total
			});
		}, function(res) {
			mainWindow.webContents.send('downloaded');

			const cp = require('child_process');
			const bat = cp.spawn('cmd.exe', ['/c', 'manager.bat']);
			
			bat.stdout.on('data', function(data) {
				console.log('stdout: ' + data);
			});

			bat.stderr.on('data', function(data) {
				console.log('stderr: ' + data);
			});

			bat.on('exit', function(code) {
				if (code == 0) {
					mainWindow.webContents.send('complete');
				} else {
					mainWindow.webContents.send('error', code);
				}
			});
		});
	} else {
		mainWindow.webContents.send('Error', 'Error! Missing config file!');
	}
});

ipcMain.on('abort', function(event, arg) {
	event.sender.send('aborted');
	downloader.abort();
});

ipcMain.on('quit', function(event, arg) {
	app.quit();
});

ipcMain.on('kill', function(event, arg) {
	process.exit(0);
});

function createWindow() {
	mainWindow = new BrowserWindow({
		minWidth: 640, 
		minHeight: 480,
		width: 640, 
		height: 480,
		maxWidth: 640, 
		maxHeight: 480,
		frame: false,
		devTools: false,
		title: 'Atualizador',
		maximizable: false,
		resizable: false
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.on('close', function(e) {
		if (downloader.isDownloading()) {
			var choice = electron.dialog.showMessageBox(this, {
				type: 'question',
				buttons: ['Sim', 'Não'],
				title: 'Confirmação',
				message: 'Deseja encerrar o Atualizador?'
			});

			if (choice != 1) {

			} else {
				e.preventDefault(); 
			} 
		}
	});

	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	app.quit();
});