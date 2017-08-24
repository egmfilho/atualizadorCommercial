/*
* @Author: egmfilho
* @Date:   2017-06-06 09:08:17
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-24 08:17:28
*/

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const ipcMain = electron.ipcMain;

const path = require('path');
const url = require('url');

// require('electron-debug')({showDevTools: true, enabled: true});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let downloader = require('./downloader.js');

ipcMain.on('begin-download', function(event, arg) {
	var config = require('./config.json'),
		status = downloader.downloadStatus;

	if (config) {
		event.sender.send('download');

		downloader.download({
			url: config.url, 
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
			
			var stderr = '';
			bat.stderr.on('data', function(data) {
				stderr = data;
				console.log('stderr: ' + data);
			});

			bat.on('exit', function(code) {
				if (code == 0) {
					mainWindow.webContents.send('complete');
				} else {
					mainWindow.webContents.send('error', stderr);
				}
			});
		});
	} else {
		mainWindow.webContents.send('Error! Missing config file!');
	}
});

ipcMain.on('abort', function(event, arg) {
	downloader.abort();
	event.sender.send('aborted');
});

ipcMain.on('quit', function(event, arg) {
	app.quit();
});

ipcMain.on('kill', function(event, arg) {
	process.exit(0);
});

function createWindow() {
	// Create the browser window.
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

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	setTimeout(function() {
		mainWindow.webContents.send('teste', app.getPath('temp').toString());
	}, 3000);

	mainWindow.on('close', function(e) {
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
			
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	
	// if (process.platform !== 'darwin') {
		app.quit();
	// }
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});