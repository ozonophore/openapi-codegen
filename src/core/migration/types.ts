export type TrafficSplitterStrategy = 'weighted' | 'round-robin' | 'header-based' | 'header-and-weighted';

export type TrafficSplitterConfig = {
    enabled?: boolean;
    strategy?: TrafficSplitterStrategy;
    oldClientWeight?: number;
    newClientWeight?: number;
    stickySessions?: boolean;
    sessionDuration?: string;
    headerName?: string;
    headerValues?: { old: string; new: string };
};

export type TrafficSplittingResult = {
    isNewClient: boolean;
};

export type SessionStats = {
    totalRequests: number;
    newClientRequests: number;
    oldClientRequests: number;
    stickySessionHits: number;
};
