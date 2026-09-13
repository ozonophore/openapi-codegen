export type TrafficSplitterStrategy = 'weighted' | 'round-robin' | 'header-based' | 'header-and-weighted';

export type TrafficSplitterConfig = {
    enabled?: boolean;
    strategy?: TrafficSplitterStrategy;
    newClientWeight?: number;
    stickySessions?: boolean;
    sessionDuration?: string;
    headerName?: string;
    headerValues?: { new: string };
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
