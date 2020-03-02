/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';

import * as types from 'vs/base/common/types';
import * as resources from 'vs/base/common/resources';
import { ExtensionsRegistry, ExtensionMessageCollector } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ExtensionData, IThemeExtensionPoint } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { Event, Emitter } from 'vs/base/common/event';
import { FileIconThemeData } from 'vs/workbench/services/themes/browser/fileIconThemeData';
import { URI } from 'vs/base/common/uri';
import { Disposable } from 'vs/base/common/lifecycle';
import { find } from 'vs/base/common/arrays';

const iconThemeExtPoint = ExtensionsRegistry.registerExtensionPoint<IThemeExtensionPoint[]>({
	extensionPoint: 'iconThemes',
	jsonSchema: {
		description: nls.localize('vscode.extension.contributes.iconThemes', 'Contributes file icon themes.'),
		type: 'array',
		items: {
			type: 'object',
			defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './fileicons/${3:id}-icon-theme.json' } }],
			properties: {
				id: {
					description: nls.localize('vscode.extension.contributes.iconThemes.id', 'Id of the icon theme as used in the user settings.'),
					type: 'string'
				},
				label: {
					description: nls.localize('vscode.extension.contributes.iconThemes.label', 'Label of the icon theme as shown in the UI.'),
					type: 'string'
				},
				path: {
					description: nls.localize('vscode.extension.contributes.iconThemes.path', 'Path of the icon theme definition file. The path is relative to the extension folder and is typically \'./icons/awesome-icon-theme.json\'.'),
					type: 'string'
				}
			},
			required: ['path', 'id']
		}
	}
});

export interface FileIconThemeChangeEvent {
	themes: FileIconThemeData[];
	added: FileIconThemeData[];
}

export class FileIconThemeStore extends Disposable {

	private knownFileIconThemes: FileIconThemeData[];

	private readonly onDidChangeEmitter = this._register(new Emitter<FileIconThemeChangeEvent>());
	readonly onDidChange: Event<FileIconThemeChangeEvent> = this.onDidChangeEmitter.event;

	constructor(@IExtensionService private readonly extensionService: IExtensionService) {
		super();
		this.knownFileIconThemes = [];
		this.initialize();
	}

	private initialize() {
		iconThemeExtPoint.setHandler((extensions) => {
			const previousIds: { [key: string]: boolean; } = {};
			const added: FileIconThemeData[] = [];
			for (const theme of this.knownFileIconThemes) {
				previousIds[theme.id] = true;
			}
			this.knownFileIconThemes.length = 0;
			for (let ext of extensions) {
				let extensionData = {
					extensionId: ext.description.identifier.value,
					extensionPublisher: ext.description.publisher,
					extensionName: ext.description.name,
					extensionIsBuiltin: ext.description.isBuiltin,
					extensionLocation: ext.description.extensionLocation
				};
				this.onFileIconThemes(extensionData, ext.value, ext.collector);
			}
			for (const theme of this.knownFileIconThemes) {
				if (!previousIds[theme.id]) {
					added.push(theme);
				}
			}
			this.onDidChangeEmitter.fire({ themes: this.knownFileIconThemes, added });
		});
	}

	private onFileIconThemes(extensionData: ExtensionData, iconThemes: IThemeExtensionPoint[], collector: ExtensionMessageCollector): void {
		if (!Array.isArray(iconThemes)) {
			collector.error(nls.localize(
				'reqarray',
				"Extension point `{0}` must be an array.",
				iconThemeExtPoint.name
			));
			return;
		}
		iconThemes.forEach(iconTheme => {
			if (!iconTheme.path || !types.isString(iconTheme.path)) {
				collector.error(nls.localize(
					'reqpath',
					"Expected string in `contributes.{0}.path`. Provided value: {1}",
					iconThemeExtPoint.name,
					String(iconTheme.path)
				));
				return;
			}
			if (!iconTheme.id || !types.isString(iconTheme.id)) {
				collector.error(nls.localize(
					'reqid',
					"Expected string in `contributes.{0}.id`. Provided value: {1}",
					iconThemeExtPoint.name,
					String(iconTheme.path)
				));
				return;
			}

			const iconThemeLocation = resources.joinPath(extensionData.extensionLocation, iconTheme.path);
			if (!resources.isEqualOrParent(iconThemeLocation, extensionData.extensionLocation)) {
				collector.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", iconThemeExtPoint.name, iconThemeLocation.path, extensionData.extensionLocation.path));
			}

			let themeData = FileIconThemeData.fromExtensionTheme(iconTheme, iconThemeLocation, extensionData);
			this.knownFileIconThemes.push(themeData);
		});

	}

	public findThemeData(iconTheme: string): Promise<FileIconThemeData | undefined> {
		if (iconTheme.length === 0) {
			return Promise.resolve(FileIconThemeData.noIconTheme());
		}
		return this.getFileIconThemes().then(allIconSets => {
			return find(allIconSets, iconSet => iconSet.id === iconTheme);
		});
	}

	public findThemeBySettingsId(settingsId: string | null): Promise<FileIconThemeData | undefined> {
		if (!settingsId) {
			return Promise.resolve(FileIconThemeData.noIconTheme());
		}
		return this.getFileIconThemes().then(allIconSets => {
			return find(allIconSets, iconSet => iconSet.settingsId === settingsId);
		});
	}

	public findThemeDataByExtensionLocation(extLocation: URI | undefined): Promise<FileIconThemeData[]> {
		if (extLocation) {
			return this.getFileIconThemes().then(allThemes => {
				return allThemes.filter(t => t.extensionData && resources.isEqualOrParent(t.extensionData.extensionLocation, extLocation));
			});
		}
		return Promise.resolve([]);
	}

	public getFileIconThemes(): Promise<FileIconThemeData[]> {
		return this.extensionService.whenInstalledExtensionsRegistered().then(isReady => {
			return this.knownFileIconThemes;
		});
	}
}
