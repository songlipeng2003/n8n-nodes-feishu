const fs = require('node:fs');

function getReleaseInfo(pkg, tag = '') {
	const version = pkg.version;
	const match = typeof version === 'string' && version.match(
		/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/,
	);
	if (!match || match[4]?.split('.').some((part) => /^0\d+$/.test(part))) {
		throw new Error(`Invalid release version: ${version}`);
	}
	if (tag && tag !== `v${version}`) {
		throw new Error(`Tag ${tag} must match package.json version v${version}`);
	}
	return { npm_tag: match[4] ? 'next' : 'latest' };
}

if (require.main === module) {
	try {
		const info = getReleaseInfo(require('../package.json'), process.env.RELEASE_TAG);
		if (process.env.GITHUB_OUTPUT) {
			fs.appendFileSync(process.env.GITHUB_OUTPUT, `npm_tag=${info.npm_tag}\n`);
		}
		console.log(`Release validated; npm dist-tag: ${info.npm_tag}`);
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}

module.exports = { getReleaseInfo };
