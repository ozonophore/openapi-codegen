import { TrafficSplitterConfig, TrafficSplittingResult } from './types';

export class TrafficSplitter {
    private readonly DEFAULT_CONFIG: TrafficSplitterConfig = {
        enabled: true,
        strategy: 'weighted',
        oldClientWeight: 50,
        newClientWeight: 50,
        stickySessions: true,
        sessionDuration: '1h',
    };

    private sessionMap: Map<string, { client: string; timestamp: number }> = new Map();

    /**
     * Determine which client to use based on current strategy
     */
    public routeRequest(clientId: string, config?: Partial<TrafficSplitterConfig>, requestHeaders?: Record<string, string>): TrafficSplittingResult {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };

        if (!mergedConfig.enabled) {
            return {
                clientKey: 'old',
                isNewClient: false,
                weight: 1,
                reason: 'Traffic splitting disabled',
            };
        }

        switch (mergedConfig.strategy) {
            case 'round-robin':
                return this.roundRobinRoute(clientId);
            case 'weighted':
                return this.weightedRoute(clientId, mergedConfig);
            case 'header-based':
                return this.headerBasedRoute(clientId, mergedConfig, requestHeaders);
            case 'header-and-weighted':
                return this.headerAndWeightedRoute(clientId, mergedConfig, requestHeaders);
            default:
                return this.weightedRoute(clientId, mergedConfig);
        }
    }

    /**
     * Round-robin strategy: alternate between old and new
     */
    private roundRobinRoute(clientId: string): TrafficSplittingResult {
        const hash = this.hashString(clientId);
        const isNewClient = hash % 2 === 0;

        return {
            clientKey: isNewClient ? 'new' : 'old',
            isNewClient,
            weight: 0.5,
            reason: 'Round-robin distribution',
        };
    }

    /**
     * Weighted strategy: route based on configured weights
     */
    private weightedRoute(clientId: string, config: TrafficSplitterConfig): TrafficSplittingResult {
        const oldWeight = config.oldClientWeight || 50;
        const newWeight = config.newClientWeight || 50;
        const totalWeight = oldWeight + newWeight;

        const hash = this.hashString(clientId);
        const randomValue = (hash % 1000) / 1000;

        const oldThreshold = oldWeight / totalWeight;

        if (randomValue < oldThreshold) {
            return {
                clientKey: 'old',
                isNewClient: false,
                weight: oldWeight / totalWeight,
                reason: `Weighted routing (old: ${oldWeight}%, new: ${newWeight}%)`,
            };
        }

        return {
            clientKey: 'new',
            isNewClient: true,
            weight: newWeight / totalWeight,
            reason: `Weighted routing (old: ${oldWeight}%, new: ${newWeight}%)`,
        };
    }

    /**
     * Header-based strategy: route based on HTTP header value
     */
    private headerBasedRoute(clientId: string, config: TrafficSplitterConfig, requestHeaders?: Record<string, string>): TrafficSplittingResult {
        const headerRoute = this.resolveHeaderRoute(config, requestHeaders);
        if (headerRoute) {
            return headerRoute;
        }

        const hash = this.hashString(clientId);
        const isNewClient = hash % 2 === 0;

        return {
            clientKey: isNewClient ? 'new' : 'old',
            isNewClient,
            weight: 0.5,
            reason: 'Header-based routing (fallback: hash distribution)',
        };
    }

    /**
     * Header and weighted combined strategy
     */
    private headerAndWeightedRoute(clientId: string, config: TrafficSplitterConfig, requestHeaders?: Record<string, string>): TrafficSplittingResult {
        const headerRoute = this.resolveHeaderRoute(config, requestHeaders);
        if (headerRoute) {
            if (config.stickySessions) {
                this.sessionMap.set(clientId, {
                    client: headerRoute.clientKey,
                    timestamp: Date.now(),
                });
            }
            return headerRoute;
        }

        if (config.stickySessions) {
            const existingSession = this.sessionMap.get(clientId);
            const now = Date.now();
            const sessionDurationMs = this.parseDurationToMs(config.sessionDuration || '1h');

            if (existingSession && now - existingSession.timestamp < sessionDurationMs) {
                return {
                    clientKey: existingSession.client,
                    isNewClient: existingSession.client === 'new',
                    weight: existingSession.client === 'new' ? config.newClientWeight || 50 : config.oldClientWeight || 50,
                    reason: 'Sticky session routing',
                };
            }
        }

        const result = this.weightedRoute(clientId, config);

        if (config.stickySessions) {
            this.sessionMap.set(clientId, {
                client: result.clientKey,
                timestamp: Date.now(),
            });

            if (Math.random() < 0.01) {
                this.cleanupOldSessions(config.sessionDuration || '1h');
            }
        }

        return result;
    }

    /**
     * Resolve routing from configured header name and values
     */
    private resolveHeaderRoute(config: TrafficSplitterConfig, requestHeaders?: Record<string, string>): TrafficSplittingResult | null {
        const headerName = config.headerName;
        const headerValues = config.headerValues;

        if (!headerName || !headerValues || !requestHeaders) {
            return null;
        }

        const headerValue = this.getHeaderValue(requestHeaders, headerName);
        if (headerValue === undefined) {
            return null;
        }

        if (headerValue === headerValues.new) {
            return {
                clientKey: 'new',
                isNewClient: true,
                weight: 1,
                reason: `Header-based routing (${headerName}=${headerValue})`,
            };
        }

        if (headerValue === headerValues.old) {
            return {
                clientKey: 'old',
                isNewClient: false,
                weight: 1,
                reason: `Header-based routing (${headerName}=${headerValue})`,
            };
        }

        return null;
    }

    /**
     * Case-insensitive header lookup
     */
    private getHeaderValue(requestHeaders: Record<string, string>, headerName: string): string | undefined {
        if (headerName in requestHeaders) {
            return requestHeaders[headerName];
        }

        const lowerName = headerName.toLowerCase();
        for (const [key, value] of Object.entries(requestHeaders)) {
            if (key.toLowerCase() === lowerName) {
                return value;
            }
        }

        return undefined;
    }

    /**
     * Hash a string to get a consistent numeric value
     */
    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Parse duration string to milliseconds
     */
    private parseDurationToMs(duration: string): number {
        const match = duration.match(/(\d+)([smhd])/);
        if (!match) return 60 * 60 * 1000;

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            default:
                return 60 * 60 * 1000;
        }
    }

    /**
     * Clean up expired sessions
     */
    private cleanupOldSessions(sessionDuration: string): void {
        const sessionDurationMs = this.parseDurationToMs(sessionDuration);
        const now = Date.now();

        for (const [clientId, session] of this.sessionMap.entries()) {
            if (now - session.timestamp > sessionDurationMs) {
                this.sessionMap.delete(clientId);
            }
        }
    }

    /**
     * Get session statistics
     */
    public getSessionStats(): {
        totalSessions: number;
        oldClientSessions: number;
        newClientSessions: number;
        distribution: {
            old: string;
            new: string;
        };
    } {
        const oldCount = Array.from(this.sessionMap.values()).filter(s => s.client === 'old').length;
        const newCount = this.sessionMap.size - oldCount;

        return {
            totalSessions: this.sessionMap.size,
            oldClientSessions: oldCount,
            newClientSessions: newCount,
            distribution: {
                old: ((oldCount / (this.sessionMap.size || 1)) * 100).toFixed(2) + '%',
                new: ((newCount / (this.sessionMap.size || 1)) * 100).toFixed(2) + '%',
            },
        };
    }

    /**
     * Clear all sessions (useful for testing or resets)
     */
    public clearSessions(): void {
        this.sessionMap.clear();
    }
}
