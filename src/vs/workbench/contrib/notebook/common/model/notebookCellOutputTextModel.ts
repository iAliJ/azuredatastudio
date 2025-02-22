/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICellOutput, IOutputDto, IOutputItemDto } from 'vs/workbench/contrib/notebook/common/notebookCommon';

export class NotebookCellOutputTextModel extends Disposable implements ICellOutput {

	private _onDidChangeData = this._register(new Emitter<void>());
	onDidChangeData = this._onDidChangeData.event;

	get outputs() {
		return this._rawOutput.outputs || [];
	}

	get metadata(): Record<string, any> | undefined {
		return this._rawOutput.metadata;
	}

	get outputId(): string {
		return this._rawOutput.outputId;
	}

	private _versionId = 0;

	get versionId() {
		return this._versionId;
	}

	constructor(
		private _rawOutput: IOutputDto
	) {
		super();
	}

	replaceData(rawData: IOutputDto) {
		this._rawOutput = rawData;
		this._versionId = this._versionId + 1;

		this._onDidChangeData.fire();
	}

	appendData(items: IOutputItemDto[]) {
		this._rawOutput.outputs.push(...items);
		this._versionId = this._versionId + 1;
		this._onDidChangeData.fire();
	}

	toJSON(): IOutputDto {
		return {
			// data: this._data,
			metadata: this._rawOutput.metadata,
			outputs: this._rawOutput.outputs,
			outputId: this._rawOutput.outputId
		};
	}
}
