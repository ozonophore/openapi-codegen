import type { SessionStats, TrafficSplitterConfig, TrafficSplittingResult } from './types';

type StickySession = {
    isNewClient: boolean;
    expiresAt: number;
};

function parseDurationMs(duration: string): number {
    const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration.trim());
    if (!match) {
        return 3600000; // default 1h
    }
    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;
    const multipliers: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] ?? 1000);
}

function hashClientId(clientId: string): number {
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
        hash = (hash * 31 + clientId.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
}

export class TrafficSplitter {
    private readonly config: TrafficSplitterConfig;
    private roundRobinCounter = 0;
    private readonly stickySessions = new Map<string, StickySession>();
    private readonly stats: SessionStats = {
        totalRequests: 0,
        newClientRequests: 0,
        oldClientRequests: 0,
        stickySessionHits: 0,
    };

    constructor(config: TrafficSplitterConfig) {
        this.config = config;
    }

    routeRequest(params: { clientId?: string; headers?: Record<string, string> }): TrafficSplittingResult {
        const { clientId = '', headers = {} } = params;
        this.stats.totalRequests++;

        if (this.config.stickySessions && clientId) {
            const existing = this.stickySessions.get(clientId);
            if (existing && existing.expiresAt > Date.now()) {
                this.stats.stickySessionHits++;
                return { isNewClient: existing.isNewClient };
            }
        }

        const isNewClient = this.resolveRoute(clientId, headers);

        if (this.config.stickySessions && clientId) {
            const ttl = parseDurationMs(this.config.sessionDuration ?? '1h');
            this.stickySessions.set(clientId, { isNewClient, expiresAt: Date.now() + ttl });
        }

        if (isNewClient) {
            this.stats.newClientRequests++;
        } else {
            this.stats.oldClientRequests++;
        }

        return { isNewClient };
    }

    private resolveRoute(clientId: string, headers: Record<string, string>): boolean {
        const strategy = this.config.strategy ?? 'weighted';

        switch (strategy) {
            case 'weighted':
                return this.weightedRoute(clientId);

            case 'round-robin':
                return this.roundRobinRoute();

            case 'header-based':
                return this.headerBasedRoute(headers);

            case 'header-and-weighted': {
                const headerResult = this.headerBasedRouteOrNull(headers);
                return headerResult !== null ? headerResult : this.weightedRoute(clientId);
            }
        }
    }

    private weightedRoute(clientId: string): boolean {
        const weight = this.config.newClientWeight ?? 50;
        return hashClientId(clientId) % 100 < weight;
    }

    private roundRobinRoute(): boolean {
        const result = this.roundRobinCounter % 2 === 1;
        this.roundRobinCounter++;
        return result;
    }

    private headerBasedRoute(headers: Record<string, string>): boolean {
        const result = this.headerBasedRouteOrNull(headers);
        return result ?? false;
    }

    private headerBasedRouteOrNull(headers: Record<string, string>): boolean | null {
        const headerName = this.config.headerName;
        if (!headerName) {
            return null;
        }
        const headerValue = headers[headerName] ?? headers[headerName.toLowerCase()];
        if (headerValue === undefined) {
            return null;
        }
        const newValue = this.config.headerValues?.new;
        return newValue !== undefined ? headerValue === newValue : false;
    }

    getStats(): SessionStats {
        return { ...this.stats };
    }
}
