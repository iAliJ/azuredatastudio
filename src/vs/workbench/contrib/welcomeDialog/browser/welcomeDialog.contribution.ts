/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LifecyclePhase } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry, IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Disposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { WelcomeWidget } from 'vs/workbench/contrib/welcomeDialog/browser/welcomeWidget';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWebviewService } from 'vs/workbench/contrib/webview/browser/webview';
import { IFileService } from 'vs/platform/files/common/files';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { LanguageService } from 'vs/editor/common/services/languageService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { GettingStartedDetailsRenderer } from 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedDetailsRenderer';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions, ConfigurationScope } from 'vs/platform/configuration/common/configurationRegistry';
import { localize } from 'vs/nls';
import { applicationConfigurationNodeBase } from 'vs/workbench/common/configuration';
import { RunOnceScheduler } from 'vs/base/common/async';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';

const configurationKey = 'workbench.welcome.experimental.dialog';

class WelcomeDialogContribution extends Disposable implements IWorkbenchContribution {

	private isRendered = false;

	constructor(
		@IStorageService storageService: IStorageService,
		@IBrowserWorkbenchEnvironmentService environmentService: IBrowserWorkbenchEnvironmentService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService readonly contextService: IContextKeyService,
		@ICodeEditorService readonly codeEditorService: ICodeEditorService,
		@IInstantiationService readonly instantiationService: IInstantiationService,
		@ICommandService readonly commandService: ICommandService,
		@ITelemetryService readonly telemetryService: ITelemetryService,
		@IOpenerService readonly openerService: IOpenerService,
		@IWebviewService readonly webviewService: IWebviewService,
		@IFileService readonly fileService: IFileService,
		@INotificationService readonly notificationService: INotificationService,
		@IExtensionService readonly extensionService: IExtensionService,
		@ILanguageService readonly languageService: LanguageService,
		@IEditorService readonly editorService: IEditorService
	) {
		super();

		if (!storageService.isNew(StorageScope.APPLICATION)) {
			return; // do not show if this is not the first session
		}

		const setting = configurationService.inspect<boolean>(configurationKey);
		if (!setting.value) {
			return;
		}

		const welcomeDialog = environmentService.options?.welcomeDialog;
		if (!welcomeDialog) {
			return;
		}

		this._register(editorService.onDidActiveEditorChange(() => {
			if (!this.isRendered) {

				const codeEditor = codeEditorService.getActiveCodeEditor();
				if (codeEditor?.hasModel()) {
					const scheduler = new RunOnceScheduler(() => {
						if (codeEditor === codeEditorService.getActiveCodeEditor()) {
							this.isRendered = true;
							const detailsRenderer = new GettingStartedDetailsRenderer(fileService, notificationService, extensionService, languageService);

							const welcomeWidget = new WelcomeWidget(
								codeEditor,
								instantiationService,
								commandService,
								telemetryService,
								openerService,
								webviewService,
								detailsRenderer);

							welcomeWidget.render(welcomeDialog.title,
								welcomeDialog.message,
								welcomeDialog.buttonText,
								welcomeDialog.buttonCommand,
								welcomeDialog.media);
						}
					}, 3000);

					this._register(codeEditor.onDidChangeModelContent((e) => {
						if (!this.isRendered) {
							scheduler.schedule();
						}
					}));
				}
			}
		}));
	}
}

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(WelcomeDialogContribution, LifecyclePhase.Eventually);

const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
	...applicationConfigurationNodeBase,
	properties: {
		'workbench.welcome.experimental.dialog': {
			scope: ConfigurationScope.APPLICATION,
			type: 'boolean',
			default: false,
			tags: ['experimental'],
			description: localize('workbench.welcome.dialog', "When enabled, a welcome widget is shown in the editor")
		}
	}
});
