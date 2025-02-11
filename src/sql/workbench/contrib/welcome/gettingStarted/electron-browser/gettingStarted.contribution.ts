/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { NativeEnablePreviewFeatures } from 'sql/workbench/contrib/welcome/gettingStarted/electron-browser/enablePreviewFeatures';
import { ShowGettingStartedAction } from 'sql/workbench/contrib/welcome/gettingStarted/electron-browser/gettingStarted';
import { registerAction2 } from 'vs/platform/actions/common/actions';

Registry
	.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(NativeEnablePreviewFeatures, LifecyclePhase.Eventually);

registerAction2(ShowGettingStartedAction);
