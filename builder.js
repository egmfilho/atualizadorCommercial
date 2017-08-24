/*
* @Author: egmfilho
* @Date:   2017-06-09 14:15:02
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-23 18:00:44
*/

const packager = require('electron-packager');
const path     = require('path');

let platform = process.argv.slice(2)[0];
let icon     = path.join(__dirname, platform == 'darwin' ? 'atualizador.icns' : 'atualizador.ico');
let arch     = process.argv.slice(3)[0];

let options = {
	'dir': __dirname,
	'asar': false,
	'arch': arch || 'x64',
	'platform': platform,
	'icon': icon,
	'name': 'Atualizador',
	'out': path.join(__dirname, 'releases'),
	'overwrite': true,
	'version-string': {
		'CompanyName': 'Futura Agência',
		'FileDescription': 'Atualizador automático do sistema Commercial',
		'OriginalFilename': 'Atualizador',
		'ProductName': 'Atualizador',
		'InternalName': 'Atualizador'
	},
	'ignore': [
		'releases/',
		'.gitignore',
		'builder.js',
		'atualizador.icns',
		'atualizador.ico',
		'atualizador.png',
		'README.md',
		'update.*'
	]
};

console.log('>>> Starting Electron Packager proccess...');
packager(options, (err, appPaths) => {
	if (err)
		console.log(err);
	else
		console.log('>>> Electron Packager proccess done!');
});