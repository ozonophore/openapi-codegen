import boxen from 'boxen';
import chalk from 'chalk';
import { exec } from 'child_process';
import Configstore from 'configstore';
import semver from 'semver';
import { promisify } from 'util';

import { ELogLevel, ELogOutput } from './Enums';
import { Logger } from './Logger';

const execAsync = promisify(exec);

// one week
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 * 24 * 7;

const INCLUDED_RELEASE_TYPES: semver.ReleaseType[] = ['major', 'minor'];

type TPackageStoreInfo = {
    currentVersion: string;
    differenceType: semver.ReleaseType | null;
    latestVersion: string;
    packageName: string;
};

interface IUpdateChecker {
    fetchLatestVersion(): Promise<string | null>;
}

interface INotificationService {
    notify(updateInfo: TPackageStoreInfo): void;
}

/**
 * Default implementation for fetching package version from npm registry
 */
class NpmUpdateChecker implements IUpdateChecker {
    constructor(private packageName: string) {}

    async fetchLatestVersion(): Promise<string | null> {
        try {
            // We get all versions of the package
            const { stdout } = await execAsync(`npm view ${this.packageName} versions --json`, {
                timeout: 5000, // 5 seconds timeout
            });

            const versions: string[] = JSON.parse(stdout);

            if (!Array.isArray(versions) || versions.length === 0) {
                return null;
            }

            // Filtering stable versions (excluding pre-release: alpha, beta, rc, etc.)
            const stableVersions = versions.filter(version => {
                const parsed = semver.parse(version);
                return parsed && !parsed.prerelease.length;
            });

            if (stableVersions.length === 0) {
                // If there are no stable versions, we return the latest of all
                return versions[versions.length - 1];
            }

            // We sort the stable versions and return the latest one.
            stableVersions.sort((a, b) => semver.compare(a, b));
            return stableVersions[stableVersions.length - 1];
        } catch {
            return null;
        }
    }
}

/**
 * Default implementation for console notifications
 */
class ConsoleNotificationService implements INotificationService {
    notify(updateInfo: TPackageStoreInfo): void {
        const { packageName, currentVersion, latestVersion } = updateInfo;

        const scriptText = chalk.yellowBright(`npm i -D ${packageName}@${latestVersion}`);
        const message = `
        An update is available: ${chalk.gray(currentVersion)} -> ${chalk.greenBright(latestVersion)}
        Run ${scriptText} to update
        `;

        console.log(
            boxen(message, {
                borderColor: 'cyanBright',
                margin: 1,
                padding: 1,
                title: 'Pay attention',
                titleAlignment: 'center',
                textAlignment: 'center',
            })
        );
    }
}

interface IUpdateNotifierOptions {
    packageName: string;
    packageVersion: string;
    logger?: Logger;
    updateChecker?: IUpdateChecker;
    notificationService?: INotificationService;
    checkInterval?: number;
    enabled?: boolean;
}

/**
 * A class for tracking the release of a newer version of the generator
 */
export class UpdateNotifier {
    private _packageName: string;
    private _packageVersion: string;
    private _configStore: Configstore | null = null;
    private _packageStoreInfo: TPackageStoreInfo | null = null;
    private _logger: Logger;
    private _updateChecker: IUpdateChecker;
    private _notificationService: INotificationService;
    private _checkInterval: number;
    private _enabled: boolean;

    constructor(options: IUpdateNotifierOptions) {
        this._packageName = options.packageName;
        this._packageVersion = options.packageVersion;
        this._logger =
            options.logger ??
            new Logger({
                instanceId: '',
                level: ELogLevel.INFO,
                logOutput: ELogOutput.CONSOLE,
            });
        this._updateChecker = options.updateChecker ?? new NpmUpdateChecker(this._packageName);
        this._notificationService = options.notificationService ?? new ConsoleNotificationService();
        this._checkInterval = options.checkInterval ?? UPDATE_CHECK_INTERVAL;
        this._enabled = options.enabled ?? true;

        if (!this._packageName || !this._packageVersion) {
            this._logger.warn(`
                The necessary parameters for checking the version are not specified.
                Current values packageName: ${this._packageName}, packageVersion: ${this._packageVersion}
            `);
        }

        if (!this._enabled) {
            return;
        }

        try {
            this._configStore = new Configstore(`-${this._packageName}`, {
                lastUpdateCheck: Date.now(),
            });
        } catch {
            this._logger.warn('The settings store has not been created. The package update will be checked more often than once every 1 week!');
        }
    }

    /**
     * Requests the latest version of the generator via npm
     */
    private async fetchNpmPackageInfo(): Promise<TPackageStoreInfo | null> {
        const latestVersion = await this._updateChecker.fetchLatestVersion();

        if (!latestVersion) {
            this._logger.warn("Couldn't get information about the latest current version");
            return null;
        }

        const releaseType = semver.diff(this._packageVersion, latestVersion);

        return {
            currentVersion: this._packageVersion,
            differenceType: releaseType,
            latestVersion,
            packageName: this._packageName,
        };
    }

    /**
     * Checks for updates and writes useful information to the cache
     */
    private async checkUpdate(): Promise<void> {
        if (!this._configStore || !this._enabled) {
            return;
        }

        const fetchInfo = await this.fetchNpmPackageInfo();

        // We update lastUpdateCheck ONLY if we find a suitable update (major/minor)
        // This ensures that the check will be repeated until a suitable version is found
        if (fetchInfo?.differenceType && INCLUDED_RELEASE_TYPES.includes(fetchInfo.differenceType)) {
            this._configStore.set('package_store_info', fetchInfo);
            this._configStore.set('lastUpdateCheck', Date.now());
            this._packageStoreInfo = fetchInfo;
        }
        // If no suitable update found, we don't update lastUpdateCheck,
        // so the check will happen again on next run
    }

    /**
     * Checks for updates and notifies about the possibility to install a new version.
     * This method waits for the check to complete before returning.
     */
    async checkAndNotify(): Promise<void> {
        if (!this._configStore || !this._enabled) {
            return;
        }

        try {
            // First, check if we have cached update info
            const cachedInfo = this._configStore.get('package_store_info') as TPackageStoreInfo | null;
            
            if (cachedInfo) {
                // Update current version in cache
                cachedInfo.currentVersion = this._packageVersion;
                
                // Check if we need to show notification
                if (semver.gt(cachedInfo.latestVersion, cachedInfo.currentVersion)) {
                    this._notificationService.notify(cachedInfo);
                    // Remove from cache after showing, so we don't show it again
                    this._configStore.delete('package_store_info');
                    return;
                } else {
                    // Version is already up to date, clear cache
                    this._configStore.delete('package_store_info');
                }
            }

            // Check if we need to perform a new check
            const lastCheck = this._configStore.get('lastUpdateCheck') as number;
            if (Date.now() - lastCheck < this._checkInterval) {
                // return;
            }

            // Perform update check and WAIT for it to complete
            await this.checkUpdate();

            // After check, see if we have info to show
            if (this._packageStoreInfo && semver.gt(this._packageStoreInfo.latestVersion, this._packageStoreInfo.currentVersion)) {
                this._notificationService.notify(this._packageStoreInfo);
                // Remove from cache after showing
                this._configStore.delete('package_store_info');
            }
        } catch (error) {
            // Silently fail - update check should not break the main flow
            this._logger.warn(`Update check failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        // REMOVED shutdownLogger() - Logger lifecycle should be managed at application level
    }

    /**
     * Synchronous version for backward compatibility
     * @deprecated Use checkAndNotify() instead
     */
    checkAndNotifySync(): void {
        // For backward compatibility, but should be removed
        this.checkAndNotify().catch(() => {
            // Ignore errors in sync version
        });
    }
}
