/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { parentOriginHash } from 'vs/workbench/browser/iframe';

suite('parentOriginHash', () => {

	test('localhost 1', async () => {
		const hash = await parentOriginHash('http://localhost:9888', '123456');
		assert.strictEqual(hash, '0fnsiac2jaup1t266qekgr7iuj4pnm31gf8r0h1o6k2lvvmfh6hk');
	});

	test('localhost 2', async () => {
		const hash = await parentOriginHash('http://localhost:9888', '123457');
		assert.strictEqual(hash, '07shf01bmdfrghk96voldpletbh36vj7blnl4td8kdq1sej5kjqs');
	});

	test('localhost 3', async () => {
		const hash = await parentOriginHash('http://localhost:9887', '123456');
		assert.strictEqual(hash, '1v1128i162q0nee9l89360sqan26u3pdnjrkke5ijd0sel8sbtqf');
	});
});
