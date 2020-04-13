/* eslint-disable callback-return */
const now = window.performance.now.bind(window.performance);

function median(array) {
	return array.sort()[Math.ceil(array.length / 2)];
}

function stripOutliers(array) {
	const m = median(array);

	return array.filter((a) => Math.abs(a - m) <= m * 2);
}

function sum(array) {
	return array.reduce((a, b) => a + b, 0);
}

function mean(array) {
	return sum(array) / array.length;
}

function sampleStdev(array) {
	const _array = stripOutliers(array);
	const _mean = mean(_array);

	return Math.sqrt(
		_array.map((n) => Math.pow(n - _mean, 2)).reduce((a, b) => a + b, 0) / (_array.length - 1)
	);
}

/**
 * Profiles a function and calculate a mean and stdev given a number of times.
 *
 * Based on: https://github.com/bcherny/browser-profiler
 *
 * @method profile
 * @param  {Function} callback
 * @param  {Number}   times
 * @return Object
 */

const TIMES = 100;

export default function profile(callback, times = TIMES) {
	const results = [];

	while (times--) {
		const start = now();

		callback();

		results.push(now() - start);
	}

	const outliers = stripOutliers(results);

	return {
		mean: mean(outliers),
		stdev: sampleStdev(results)
	};
}
