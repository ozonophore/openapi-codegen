import boxen from 'boxen';
import chalk from 'chalk';
import { execSync } from 'child_process';
import Configstore from 'configstore';
import semver from 'semver';

import { ELogLevel, ELogOutput } from './Enums';
import { Logger } from './Logger';

// one week
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 * 24 * 7;

const INCLUDED_RELEASE_TYPES = ['major', 'minor'];

type TPackageStoreInfo = {
    currentVersion: string;
    differenceType: semver.ReleaseType | null;
    latestVersion: string;
    packageName: string;
};

/**
 * A class for tracking the release of a newer version of the generator
 */
export class UpdateNotifier {
    private _packageName: string;
    private _packageVersion: string;
    private _configStore: Configstore | null = null;
    private _packageStoreInfo: TPackageStoreInfo | null = null;
    private _logger: Logger;

    constructor(packageName: string, packageVersion: string) {
        this._logger = new Logger({
            instanceId: '',
            level: ELogLevel.INFO,
            logOutput: ELogOutput.CONSOLE,
        });

        if (!packageName || !packageVersion) {
            this._logger.warn(`
                The necessary parameters for checking the version are not specified.
                Current values packageName: ${packageName}, packageVersion: ${packageVersion}
            `);
        }

        this._packageName = packageName;
        this._packageVersion = packageVersion;

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
    private fetchNpmPackageInfo(): TPackageStoreInfo | null {
        try {
            const latestVersion = execSync(`npm view ${this._packageName} version`).toString().trim();
            const releaseType = semver.diff(this._packageVersion, latestVersion);

            return {
                currentVersion: this._packageVersion,
                differenceType: releaseType,
                latestVersion,
                packageName: this._packageName,
            };
        } catch {
            this._logger.warn("Couldn't get information about the latest current version");

            return null;
        }
    }

    /**
     * Checks for updates and writes useful information to the cache
     */
    private checkUpdate() {
        if (!this._configStore) {
            return;
        }

        this._packageStoreInfo = this._configStore.get('package_store_info') as TPackageStoreInfo;
        if (this._packageStoreInfo) {
            this._packageStoreInfo.currentVersion = this._packageVersion;
            // clean cache
            this._configStore.delete('package_store_info');
        }

        if (Date.now() - this._configStore.get('lastUpdateCheck') < UPDATE_CHECK_INTERVAL) {
            return;
        }

        const fetchInfo = this.fetchNpmPackageInfo();
        this._configStore.set('lastUpdateCheck', Date.now());

        if (fetchInfo?.differenceType && INCLUDED_RELEASE_TYPES.includes(fetchInfo.differenceType)) {
            this._configStore.set('package_store_info', fetchInfo);
        }
    }

    /**
     * Checks for updates and notifies about the possibility to install a new version.
     */
    checkAndNotify() {
        if (!this._configStore) {
            this._logger.warn("Couldn't get information about the latest current version");
            this._logger.shutdownLogger();

            return;
        }

        this.checkUpdate();

        if (!this._packageStoreInfo || !semver.gt(this._packageStoreInfo.latestVersion, this._packageStoreInfo.currentVersion)) {
            return;
        }

        const { packageName, currentVersion, latestVersion } = this._packageStoreInfo;

        const scriptText = chalk.yellowBright(`npm i -D ${packageName}@${latestVersion}`);
        const message = `
        An update is available: ${chalk.gray(currentVersion)} -> ${chalk.greenBright(latestVersion)}}
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

        this._logger.shutdownLogger();
    }
}
