/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionTipsService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';

import QueryRunner, { IQueryMessage } from 'sql/platform/query/common/queryRunner';
import { SaveFormat } from 'sql/workbench/parts/grid/common/interfaces';
import { Table } from 'sql/base/browser/ui/table/table';
import { QueryEditor } from './queryEditor';
import { CellSelectionModel } from 'sql/base/browser/ui/table/plugins/cellSelectionModel.plugin';
import { IGridDataProvider } from 'sql/platform/query/common/gridDataProvider';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { GridTableState } from 'sql/workbench/parts/query/common/gridPanelState';
import * as Constants from 'sql/workbench/contrib/extensions/common/constants';
import { IAdsTelemetryService } from 'sql/platform/telemetry/common/telemetry';
import * as TelemetryKeys from 'sql/platform/telemetry/common/telemetryKeys';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/resourceConfiguration';
import { URI } from 'vs/base/common/uri';
import { Schemas } from 'vs/base/common/network';

export interface IGridActionContext {
	gridDataProvider: IGridDataProvider;
	table: Table<any>;
	tableState: GridTableState;
	cell?: { row: number; cell: number; };
	selection?: Slick.Range[];
	selectionModel?: CellSelectionModel<any>;
	batchId: number;
	resultId: number;
}

export interface IMessagesActionContext {
	selection: string;
	messages: IQueryMessage[];
}

function mapForNumberColumn(ranges: Slick.Range[]): Slick.Range[] {
	if (ranges) {
		return ranges.map(e => new Slick.Range(e.fromRow, e.fromCell - 1, e.toRow, e.toCell ? e.toCell - 1 : undefined));
	} else {
		return undefined;
	}
}

export class SaveResultAction extends Action {
	public static SAVECSV_ID = 'grid.saveAsCsv';
	public static SAVECSV_LABEL = localize('saveAsCsv', "Save As CSV");
	public static SAVECSV_ICON = 'saveCsv';

	public static SAVEJSON_ID = 'grid.saveAsJson';
	public static SAVEJSON_LABEL = localize('saveAsJson', "Save As JSON");
	public static SAVEJSON_ICON = 'saveJson';

	public static SAVEEXCEL_ID = 'grid.saveAsExcel';
	public static SAVEEXCEL_LABEL = localize('saveAsExcel', "Save As Excel");
	public static SAVEEXCEL_ICON = 'saveExcel';

	public static SAVEXML_ID = 'grid.saveAsXml';
	public static SAVEXML_LABEL = localize('saveAsXml', "Save As XML");
	public static SAVEXML_ICON = 'saveXml';

	constructor(
		id: string,
		label: string,
		icon: string,
		private format: SaveFormat,
		@INotificationService private notificationService: INotificationService
	) {
		super(id, label, icon);
	}

	public async run(context: IGridActionContext): Promise<boolean> {
		if (!context.gridDataProvider.canSerialize) {
			this.notificationService.warn(localize('saveToFileNotSupported', "Save to file is not supported by the backing data source"));
		}
		await context.gridDataProvider.serializeResults(this.format, mapForNumberColumn(context.selection));
		return true;
	}
}

export class CopyResultAction extends Action {
	public static COPY_ID = 'grid.copySelection';
	public static COPY_LABEL = localize('copySelection', "Copy");

	public static COPYWITHHEADERS_ID = 'grid.copyWithHeaders';
	public static COPYWITHHEADERS_LABEL = localize('copyWithHeaders', "Copy With Headers");

	constructor(
		id: string,
		label: string,
		private copyHeader: boolean,
		private accountForNumberColumn = true
	) {
		super(id, label);
	}

	public run(context: IGridActionContext): Promise<boolean> {
		if (this.accountForNumberColumn) {
			context.gridDataProvider.copyResults(
				mapForNumberColumn(context.selection),
				this.copyHeader);
		} else {
			context.gridDataProvider.copyResults(context.selection, this.copyHeader);
		}
		return Promise.resolve(true);
	}
}

export class SelectAllGridAction extends Action {
	public static ID = 'grid.selectAll';
	public static LABEL = localize('selectAll', "Select All");

	constructor() {
		super(SelectAllGridAction.ID, SelectAllGridAction.LABEL);
	}

	public run(context: IGridActionContext): Promise<boolean> {
		context.selectionModel.setSelectedRanges([new Slick.Range(0, 0, context.table.getData().getLength() - 1, context.table.columns.length - 1)]);
		return Promise.resolve(true);
	}
}

export class CopyMessagesAction extends Action {
	public static ID = 'grid.messages.copy';
	public static LABEL = localize('copyMessages', "Copy");

	constructor(
		@IClipboardService private clipboardService: IClipboardService
	) {
		super(CopyMessagesAction.ID, CopyMessagesAction.LABEL);
	}

	public run(context: IMessagesActionContext): Promise<boolean> {
		this.clipboardService.writeText(context.selection);
		return Promise.resolve(true);
	}
}

export class CopyAllMessagesAction extends Action {
	public static ID = 'grid.messages.copyAll';
	public static LABEL = localize('copyAll', "Copy All");

	constructor(
		@IClipboardService private clipboardService: IClipboardService,
		@ITextResourcePropertiesService private readonly resourcePropertiesService: ITextResourcePropertiesService) {
		super(CopyAllMessagesAction.ID, CopyAllMessagesAction.LABEL);
	}

	public run(context: IMessagesActionContext): Promise<void> {
		const eol = this.resourcePropertiesService.getEOL(URI.from({ scheme: Schemas.untitled, path: '1' })) === '\r\n' ? '\r\n' : '\n';
		const text = context.messages.reduce((p, m) => {
			if (m.selection) {
				p += m.time + '\t';
			}
			p += m.message + eol;
			return p;
		}, '');
		this.clipboardService.writeText(text);
		return Promise.resolve();
	}
}

export class MaximizeTableAction extends Action {
	public static ID = 'grid.maximize';
	public static LABEL = localize('maximize', "Maximize");
	public static ICON = 'extendFullScreen';

	constructor() {
		super(MaximizeTableAction.ID, MaximizeTableAction.LABEL, MaximizeTableAction.ICON);
	}

	public run(context: IGridActionContext): Promise<boolean> {
		context.tableState.maximized = true;
		return Promise.resolve(true);
	}
}

export class RestoreTableAction extends Action {
	public static ID = 'grid.restore';
	public static LABEL = localize('restore', "Restore");
	public static ICON = 'exitFullScreen';

	constructor() {
		super(RestoreTableAction.ID, RestoreTableAction.LABEL, RestoreTableAction.ICON);
	}

	public run(context: IGridActionContext): Promise<boolean> {
		context.tableState.maximized = false;
		return Promise.resolve(true);
	}
}

export class ChartDataAction extends Action {
	public static ID = 'grid.chart';
	public static LABEL = localize('chart', "Chart");
	public static ICON = 'viewChart';

	constructor(
		@IEditorService private editorService: IEditorService,
		@IExtensionTipsService private readonly extensionTipsService: IExtensionTipsService,
		@IEnvironmentService private readonly environmentService: IEnvironmentService
	) {
		super(ChartDataAction.ID, ChartDataAction.LABEL, ChartDataAction.ICON);
	}

	public run(context: IGridActionContext): Promise<boolean> {
		const activeEditor = this.editorService.activeControl as QueryEditor;
		if (this.environmentService.appQuality !== 'stable') {
			this.extensionTipsService.promptRecommendedExtensionsByScenario(Constants.visualizerExtensions);
		}
		activeEditor.chart({ batchId: context.batchId, resultId: context.resultId });
		return Promise.resolve(true);
	}
}

export class VisualizerDataAction extends Action {
	public static ID = 'grid.visualizer';
	public static LABEL = localize("visualizer", "Visualizer");
	public static ICON = 'viewVisualizer';

	constructor(
		private runner: QueryRunner,
		@IAdsTelemetryService private adsTelemetryService: IAdsTelemetryService
	) {
		super(VisualizerDataAction.ID, VisualizerDataAction.LABEL, VisualizerDataAction.ICON);
	}

	public run(context: IGridActionContext): Promise<boolean> {
		this.adsTelemetryService.sendActionEvent(
			TelemetryKeys.TelemetryView.ResultsPanel,
			TelemetryKeys.TelemetryAction.Click,
			'VisualizerButton',
			'VisualizerDataAction'
		);
		this.runner.notifyVisualizeRequested(context.batchId, context.resultId);
		return Promise.resolve(true);
	}
}
