/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

'use strict';

const withBrowserDefaults = require('../../shared.webpack.config').browser;
const path = require('path');

module.exports = withBrowserDefaults({
	context: __dirname,
	entry: {
		extension: './src/browser/workerMain.ts',
	},
	output: {
		filename: 'workerMain.js',
		path: path.join(__dirname, 'dist', 'browser'),
		libraryTarget: 'var',
		library: 'serverExportVar'
	}
});
