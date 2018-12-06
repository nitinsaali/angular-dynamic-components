const child_process = require('child_process');
const _config = require("./dockerbuild.config.json");

const defaultConfig = {
	containerName: "boxchainContainer",
	containerOwner: "boxchain",
	port: 4200,
	version: ""
};

const config = Object.assign(defaultConfig, _config);
const source = `${config.containerOwner}/${config.containerName}`;

var streamLogger = function (data) {
	console.log(data.toString());
}

var exitLogger = function (code) {
	console.log(`Exit code: ${code}`);
};

var errorLogger = function (err) {
	console.log(`Err: ${err}`);
}

var killRunningImage = function () {
	try {
		child_process.execSync(`docker stop $(docker ps -q --filter ancestor=${source})`);
	} catch (err) {}

}

var tagImageVersion = function  () {
	if (config.version.length > 0) {
		console.log('Tagging image version');
		child_process.execSync(`docker tag ${source}:latest ${source}:${config.version}`);
	}
}

console.log('Killing running docker container! (needs a more graceful way to do this!)');
killRunningImage();

console.log("Building docker container...");

var dockerCompile = child_process.spawn(`docker`, [`build`, `-t`, source, `.`, `--rm`]);
dockerCompile.stdout.on('data', data => streamLogger(data));
dockerCompile.stderr.on('data', data => errorLogger(data));
dockerCompile.on('error', err => errorLogger(err));
dockerCompile.on('close', function(code) {
	if ( code === 0 ) {
		tagImageVersion();
	}
});

