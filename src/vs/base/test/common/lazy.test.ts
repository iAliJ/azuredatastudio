/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { Lazy } from 'vs/base/common/lazy';

suite('Lazy', () => {

	test('lazy values should only be resolved once', () => {
		let counter = 0;
		const value = new Lazy(() => ++counter);

		assert.strictEqual(value.hasValue, false);
		assert.strictEqual(value.value, 1);
		assert.strictEqual(value.hasValue, true);
		assert.strictEqual(value.value, 1); // make sure we did not evaluate again
	});

	test('lazy values handle error case', () => {
		let counter = 0;
		const value = new Lazy(() => { throw new Error(`${++counter}`); });

		assert.strictEqual(value.hasValue, false);
		assert.throws(() => value.value, /\b1\b/);
		assert.strictEqual(value.hasValue, true);
		assert.throws(() => value.value, /\b1\b/);
	});
});
