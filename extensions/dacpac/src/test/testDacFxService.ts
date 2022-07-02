/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as mssql from 'mssql';

export const deployOperationId = 'deploy dacpac';
export const extractOperationId = 'extract dacpac';
export const exportOperationId = 'export bacpac';
export const importOperationId = 'import bacpac';
export const generateScript = 'generate script';
export const generateDeployPlan = 'generate deploy plan';
export const validateStreamingJob = 'validate streaming job';

export class DacFxTestService implements mssql.IDacFxService {
	dacfxResult: mssql.DacFxResult = {
		success: true,
		operationId: 'test',
		errorMessage: ''
	};
	constructor() {
	}

	exportBacpac(databaseName: string, packageFilePath: string, ownerUri: string, taskExecutionMode: azdata.TaskExecutionMode): Promise<mssql.DacFxResult> {
		this.dacfxResult.operationId = exportOperationId;
		return Promise.resolve(this.dacfxResult);
	}
	importBacpac(packageFilePath: string, databaseName: string, ownerUri: string, taskExecutionMode: azdata.TaskExecutionMode): Promise<mssql.DacFxResult> {
		this.dacfxResult.operationId = importOperationId;
		return Promise.resolve(this.dacfxResult);
	}
	extractDacpac(databaseName: string, packageFilePath: string, applicationName: string, applicationVersion: string, ownerUri: string, taskExecutionMode: azdata.TaskExecutionMode): Promise<mssql.DacFxResult> {
		this.dacfxResult.operationId = extractOperationId;
		return Promise.resolve(this.dacfxResult);
	}
	createProjectFromDatabase(databaseName: string, targetFilePath: string, applicationName: string, applicationVersion: string, ownerUri: string, extractTarget: mssql.ExtractTarget, taskExecutionMode: azdata.TaskExecutionMode): Promise<mssql.DacFxResult> {
		this.dacfxResult.operationId = importOperationId;
		return Promise.resolve(this.dacfxResult);
	}
	deployDacpac(packageFilePath: string, databaseName: string, upgradeExisting: boolean, ownerUri: string, taskExecutionMode: azdata.TaskExecutionMode, sqlCommandVariableValues?: Record<string, string>): Promise<mssql.DacFxResult> {
		this.dacfxResult.operationId = deployOperationId;
		return Promise.resolve(this.dacfxResult);
	}
	generateDeployScript(packageFilePath: string, databaseName: string, ownerUri: string, taskExecutionMode: azdata.TaskExecutionMode, sqlCommandVariableValues?: Record<string, string>): Promise<mssql.DacFxResult> {
		this.dacfxResult.operationId = generateScript;
		return Promise.resolve(this.dacfxResult);
	}
	generateDeployPlan(packageFilePath: string, databaseName: string, ownerUri: string, taskExecutionMode: azdata.TaskExecutionMode): Promise<mssql.GenerateDeployPlanResult> {
		this.dacfxResult.operationId = generateDeployPlan;
		const deployPlan: mssql.GenerateDeployPlanResult = {
			operationId: generateDeployPlan,
			success: true,
			errorMessage: '',
			report: generateDeployPlan
		};
		return Promise.resolve(deployPlan);
	}
	getOptionsFromProfile(profilePath: string): Promise<mssql.DacFxOptionsResult> {
		const sampleDesc = 'Sample Description text';
		const sampleName = 'Sample Display Name';
		const optionsResult: mssql.DacFxOptionsResult = {
			success: true,
			errorMessage: '',
			deploymentOptions: {
				ignoreTableOptions: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreSemicolonBetweenStatements: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreRouteLifetime: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreRoleMembership: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreQuotedIdentifiers: { value: false, description: sampleDesc, displayName: sampleName },
				ignorePermissions: { value: false, description: sampleDesc, displayName: sampleName },
				ignorePartitionSchemes: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreObjectPlacementOnPartitionScheme: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreNotForReplication: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreLoginSids: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreLockHintsOnIndexes: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreKeywordCasing: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreIndexPadding: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreIndexOptions: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreIncrement: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreIdentitySeed: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreUserSettingsObjects: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreFullTextCatalogFilePath: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreWhitespace: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreWithNocheckOnForeignKeys: { value: false, description: sampleDesc, displayName: sampleName },
				verifyCollationCompatibility: { value: false, description: sampleDesc, displayName: sampleName },
				unmodifiableObjectWarnings: { value: false, description: sampleDesc, displayName: sampleName },
				treatVerificationErrorsAsWarnings: { value: false, description: sampleDesc, displayName: sampleName },
				scriptRefreshModule: { value: false, description: sampleDesc, displayName: sampleName },
				scriptNewConstraintValidation: { value: false, description: sampleDesc, displayName: sampleName },
				scriptFileSize: { value: false, description: sampleDesc, displayName: sampleName },
				scriptDeployStateChecks: { value: false, description: sampleDesc, displayName: sampleName },
				scriptDatabaseOptions: { value: false, description: sampleDesc, displayName: sampleName },
				scriptDatabaseCompatibility: { value: false, description: sampleDesc, displayName: sampleName },
				scriptDatabaseCollation: { value: false, description: sampleDesc, displayName: sampleName },
				runDeploymentPlanExecutors: { value: false, description: sampleDesc, displayName: sampleName },
				registerDataTierApplication: { value: false, description: sampleDesc, displayName: sampleName },
				populateFilesOnFileGroups: { value: false, description: sampleDesc, displayName: sampleName },
				noAlterStatementsToChangeClrTypes: { value: false, description: sampleDesc, displayName: sampleName },
				includeTransactionalScripts: { value: false, description: sampleDesc, displayName: sampleName },
				includeCompositeObjects: { value: false, description: sampleDesc, displayName: sampleName },
				allowUnsafeRowLevelSecurityDataMovement: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreWithNocheckOnCheckConstraints: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreFillFactor: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreFileSize: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreFilegroupPlacement: { value: false, description: sampleDesc, displayName: sampleName },
				doNotAlterReplicatedObjects: { value: false, description: sampleDesc, displayName: sampleName },
				doNotAlterChangeDataCaptureObjects: { value: false, description: sampleDesc, displayName: sampleName },
				disableAndReenableDdlTriggers: { value: false, description: sampleDesc, displayName: sampleName },
				deployDatabaseInSingleUserMode: { value: false, description: sampleDesc, displayName: sampleName },
				createNewDatabase: { value: false, description: sampleDesc, displayName: sampleName },
				compareUsingTargetCollation: { value: false, description: sampleDesc, displayName: sampleName },
				commentOutSetVarDeclarations: { value: false, description: sampleDesc, displayName: sampleName },
				blockWhenDriftDetected: { value: false, description: sampleDesc, displayName: sampleName },
				blockOnPossibleDataLoss: { value: false, description: sampleDesc, displayName: sampleName },
				backupDatabaseBeforeChanges: { value: false, description: sampleDesc, displayName: sampleName },
				allowIncompatiblePlatform: { value: false, description: sampleDesc, displayName: sampleName },
				allowDropBlockingAssemblies: { value: false, description: sampleDesc, displayName: sampleName },
				dropConstraintsNotInSource: { value: false, description: sampleDesc, displayName: sampleName },
				dropDmlTriggersNotInSource: { value: false, description: sampleDesc, displayName: sampleName },
				dropExtendedPropertiesNotInSource: { value: false, description: sampleDesc, displayName: sampleName },
				dropIndexesNotInSource: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreFileAndLogFilePath: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreExtendedProperties: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreDmlTriggerState: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreDmlTriggerOrder: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreDefaultSchema: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreDdlTriggerState: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreDdlTriggerOrder: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreCryptographicProviderFilePath: { value: false, description: sampleDesc, displayName: sampleName },
				verifyDeployment: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreComments: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreColumnCollation: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreAuthorizer: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreAnsiNulls: { value: false, description: sampleDesc, displayName: sampleName },
				generateSmartDefaults: { value: false, description: sampleDesc, displayName: sampleName },
				dropStatisticsNotInSource: { value: false, description: sampleDesc, displayName: sampleName },
				dropRoleMembersNotInSource: { value: false, description: sampleDesc, displayName: sampleName },
				dropPermissionsNotInSource: { value: false, description: sampleDesc, displayName: sampleName },
				dropObjectsNotInSource: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreColumnOrder: { value: false, description: sampleDesc, displayName: sampleName },
				doNotDropObjectTypes: { value: [], description: sampleDesc, displayName: sampleName },
				excludeObjectTypes: { value: [], description: sampleDesc, displayName: sampleName },
				ignoreTablePartitionOptions: { value: false, description: sampleDesc, displayName: sampleName },
				doNotEvaluateSqlCmdVariables: { value: false, description: sampleDesc, displayName: sampleName },
				disableParallelismForEnablingIndexes: { value: false, description: sampleDesc, displayName: sampleName },
				disableIndexesForDataPhase: { value: false, description: sampleDesc, displayName: sampleName },
				restoreSequenceCurrentValue: { value: false, description: sampleDesc, displayName: sampleName },
				rebuildIndexesOfflineForDataPhase: { value: false, description: sampleDesc, displayName: sampleName },
				isAlwaysEncryptedParameterizationEnabled: { value: false, description: sampleDesc, displayName: sampleName },
				preserveIdentityLastValues: { value: false, description: sampleDesc, displayName: sampleName },
				allowExternalLibraryPaths: { value: false, description: sampleDesc, displayName: sampleName },
				allowExternalLanguagePaths: { value: false, description: sampleDesc, displayName: sampleName },
				hashObjectNamesInLogs: { value: false, description: sampleDesc, displayName: sampleName },
				doNotDropWorkloadClassifiers: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreWorkloadClassifiers: { value: false, description: sampleDesc, displayName: sampleName },
				ignoreDatabaseWorkloadGroups: { value: false, description: sampleDesc, displayName: sampleName },
				doNotDropDatabaseWorkloadGroups: { value: false, description: sampleDesc, displayName: sampleName }
			}
		};

		return Promise.resolve(optionsResult);
	}
	validateStreamingJob(packageFilePath: string, createStreamingJobTsql: string): Promise<mssql.ValidateStreamingJobResult> {
		this.dacfxResult.operationId = validateStreamingJob;
		const streamingJobValidationResult: mssql.ValidateStreamingJobResult = {
			success: true,
			errorMessage: ''
		};
		return Promise.resolve(streamingJobValidationResult);
	}
	parseTSqlScript(filePath: string, databaseSchemaProvider: string): Thenable<mssql.ParseTSqlScriptResult> {
		return Promise.resolve({ containsCreateTableStatement: true });
	}
}
