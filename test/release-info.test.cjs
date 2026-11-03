const assert = require('node:assert/strict');
const { test } = require('node:test');
const { getReleaseInfo } = require('../scripts/release-info.cjs');

test('stable version publishes to latest', () => {
	assert.deepEqual(getReleaseInfo({ version: '0.4.6' }, 'v0.4.6'), { npm_tag: 'latest' });
});

test('prerelease publishes to next rather than overwriting latest', () => {
	for (const version of ['0.4.7-beta.1', '1.0.0-rc.0', '1.0.0-0']) {
		assert.deepEqual(getReleaseInfo({ version }, `v${version}`), { npm_tag: 'next' });
	}
});

test('manual build-only run can validate without a tag', () => {
	assert.deepEqual(getReleaseInfo({ version: '0.4.6' }), { npm_tag: 'latest' });
});

test('rejects a tag that differs from package.json', () => {
	for (const tag of ['v0.4.5', '0.4.6', 'v0.4.6-beta.1', 'v0.4.6\n']) {
		assert.throws(() => getReleaseInfo({ version: '0.4.6' }, tag), /must match/);
	}
});

test('rejects invalid or ambiguous release versions', () => {
	for (const version of [undefined, null, 46, '', 'v0.4.6', '0.4', '00.4.6', '0.4.06', '0.4.6-beta.01', '0.4.6-', '0.4.6+build', '0.4.6\n']) {
		assert.throws(() => getReleaseInfo({ version }), /Invalid release version/);
	}
});
