'use strict';
const isObservable = require('is-observable');
const symbolObservable = require('symbol-observable').default;

module.exports = async value => {
	if (!isObservable(value)) {
		throw new TypeError(`Expected an \`Observable\`, got \`${typeof value}\``);
	}

	const values = [];

	return new Promise((resolve, reject) => {
		value[symbolObservable]().subscribe({
			next: value => {
				values.push(value);
			},
			error: reject,
			complete: () => {
				resolve(values);
			}
		});
	});
};
