/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEditorFactoryRegistry, IEditorSerializer, EditorExtensions } from 'vs/workbench/common/editor';
import { Registry } from 'vs/platform/registry/common/platform';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { QueryResultsInput } from 'sql/workbench/common/editor/query/queryResultsInput';
import { FILE_EDITOR_INPUT_ID } from 'vs/workbench/contrib/files/common/files';
import { UntitledQueryEditorInput } from 'sql/workbench/browser/editor/query/untitledQueryEditorInput';
import { FileQueryEditorInput } from 'sql/workbench/browser/editor/query/fileQueryEditorInput';
import { FileEditorInput } from 'vs/workbench/contrib/files/browser/editors/fileEditorInput';
import { UntitledTextEditorInput } from 'vs/workbench/services/untitled/common/untitledTextEditorInput';
import { ILanguageAssociation } from 'sql/workbench/services/languageAssociation/common/languageAssociation';
import { QueryEditorInput } from 'sql/workbench/common/editor/query/queryEditorInput';
import { getCurrentGlobalConnection } from 'sql/workbench/browser/taskUtilities';
import { IObjectExplorerService } from 'sql/workbench/services/objectExplorer/browser/objectExplorerService';
import { IConnectionManagementService, IConnectionCompletionOptions, ConnectionType } from 'sql/platform/connection/common/connectionManagement';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { onUnexpectedError } from 'vs/base/common/errors';
import { IFileService } from 'vs/platform/files/common/files';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IQueryEditorService } from 'sql/workbench/services/queryEditor/common/queryEditorService';
import { IQueryEditorConfiguration } from 'sql/platform/query/common/query';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';

const editorFactoryRegistry = Registry.as<IEditorFactoryRegistry>(EditorExtensions.EditorFactory);

export class QueryEditorLanguageAssociation implements ILanguageAssociation {
	static readonly isDefault = true;
	/**
	 * The language IDs that are associated with the query editor. These are case sensitive for comparing with what's
	 * registered in the LanguageService registry.
	 */
	static readonly languages = ['kusto', 'loganalytics', 'sql'];	//TODO Add language id here for new languages supported in query editor. Make it easier to contribute new extension's languageID

	constructor(@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IObjectExplorerService private readonly objectExplorerService: IObjectExplorerService,
		@IConnectionManagementService private readonly connectionManagementService: IConnectionManagementService,
		@IEditorService private readonly editorService: IEditorService,
		@IQueryEditorService private readonly queryEditorService: IQueryEditorService) { }

	async convertInput(activeEditor: EditorInput): Promise<QueryEditorInput | undefined> {
		if (!(activeEditor instanceof FileEditorInput) && !(activeEditor instanceof UntitledTextEditorInput)) {
			return undefined;
		}
		const queryResultsInput = this.instantiationService.createInstance(QueryResultsInput, activeEditor.resource.toString(true));
		let queryEditorInput: QueryEditorInput;
		if (activeEditor instanceof FileEditorInput) {
			queryEditorInput = this.instantiationService.createInstance(FileQueryEditorInput, '', activeEditor, queryResultsInput);
		} else if (activeEditor instanceof UntitledTextEditorInput) {
			const content = (await activeEditor.resolve()).textEditorModel.getValue();
			queryEditorInput = await this.queryEditorService.newSqlEditor({
				resource: this.editorService.isOpened(activeEditor) ? activeEditor.resource : undefined,
				open: false, initialContent: content
			}) as UntitledQueryEditorInput;
		}

		this.connectInput(queryEditorInput);
		return queryEditorInput;
	}

	syncConvertInput(activeEditor: EditorInput): QueryEditorInput | undefined {
		const queryResultsInput = this.instantiationService.createInstance(QueryResultsInput, activeEditor.resource.toString(true));
		let queryEditorInput: QueryEditorInput;
		if (activeEditor instanceof FileEditorInput) {
			queryEditorInput = this.instantiationService.createInstance(FileQueryEditorInput, '', activeEditor, queryResultsInput);
		} else if (activeEditor instanceof UntitledTextEditorInput) {
			queryEditorInput = this.instantiationService.createInstance(UntitledQueryEditorInput, '', activeEditor, queryResultsInput);
		} else {
			return undefined;
		}

		this.connectInput(queryEditorInput);
		return queryEditorInput;
	}

	private connectInput(queryEditorInput: QueryEditorInput): void {
		const existingProfile = this.connectionManagementService.getConnectionProfile(queryEditorInput.uri);
		// Create new connection if only there is no existing connectionProfile with the uri.
		if (!existingProfile) {
			const profile = getCurrentGlobalConnection(this.objectExplorerService, this.connectionManagementService, this.editorService);
			if (profile) {
				const options: IConnectionCompletionOptions = {
					params: { connectionType: ConnectionType.editor, runQueryOnCompletion: undefined, input: queryEditorInput },
					saveTheConnection: false,
					showDashboard: false,
					showConnectionDialogOnError: true,
					showFirewallRuleOnError: true
				};
				this.connectionManagementService.connect(profile, queryEditorInput.uri, options).catch(err => onUnexpectedError(err));
			}
		}
	}

	createBase(activeEditor: QueryEditorInput): EditorInput {
		return activeEditor.text;
	}
}

export class FileQueryEditorSerializer implements IEditorSerializer {

	constructor(@IFileService private readonly fileService: IFileService) {

	}
	serialize(editorInput: FileQueryEditorInput): string {
		const factory = editorFactoryRegistry.getEditorSerializer(FILE_EDITOR_INPUT_ID);
		if (factory) {
			return factory.serialize(editorInput.text); // serialize based on the underlying input
		}
		return undefined;
	}

	deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FileQueryEditorInput | undefined {
		const factory = editorFactoryRegistry.getEditorSerializer(FILE_EDITOR_INPUT_ID);
		const fileEditorInput = factory.deserialize(instantiationService, serializedEditorInput) as FileEditorInput;
		// only successfully deserialize the file if the resource actually exists
		if (this.fileService.exists(fileEditorInput.resource)) {
			const queryResultsInput = instantiationService.createInstance(QueryResultsInput, fileEditorInput.resource.toString());
			return instantiationService.createInstance(FileQueryEditorInput, '', fileEditorInput, queryResultsInput);
		} else {
			fileEditorInput.dispose();
			return undefined;
		}
	}

	canSerialize(): boolean { // we can always serialize query inputs
		return true;
	}
}

export class UntitledQueryEditorSerializer implements IEditorSerializer {

	constructor(@IConfigurationService private readonly configurationService: IConfigurationService) { }
	serialize(editorInput: UntitledQueryEditorInput): string {
		const factory = editorFactoryRegistry.getEditorSerializer(UntitledTextEditorInput.ID);
		// only serialize non-dirty files if the user has that setting
		if (factory && (editorInput.isDirty() || this.configurationService.getValue<IQueryEditorConfiguration>('queryEditor').promptToSaveGeneratedFiles)) {
			return factory.serialize(editorInput.text); // serialize based on the underlying input
		}
		return undefined;
	}

	deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): UntitledQueryEditorInput | undefined {
		const factory = editorFactoryRegistry.getEditorSerializer(UntitledTextEditorInput.ID);
		const untitledEditorInput = factory.deserialize(instantiationService, serializedEditorInput) as UntitledTextEditorInput;
		const queryResultsInput = instantiationService.createInstance(QueryResultsInput, untitledEditorInput.resource.toString());
		return instantiationService.createInstance(UntitledQueryEditorInput, '', untitledEditorInput, queryResultsInput);
	}

	canSerialize(): boolean { // we can always serialize query inputs
		return true;
	}
}
