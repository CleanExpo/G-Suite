export type AgentCategory =
    | 'marketing'
    | 'social_media'
    | 'analytics'
    | 'creative'
    | 'customer_support'
    | 'research'
    | 'automation';

export interface AgentTemplate {
    id: string;
    name: string;
    description: string;
    category: AgentCategory;
    icon: string; // Lucide icon name or emoji
    tools: string[]; // List of tool keys
    systemPrompt: string;
    parameters: {
        name: string;
        type: 'string' | 'number' | 'boolean' | 'selection';
        description: string;
        defaultValue?: any;
        options?: string[]; // For selection type
    }[];
    v81Refined?: boolean; // Matches the Refined standard
    author?: string;
    popularity?: number; // 0-100
}

export interface MarketplaceItem {
    template: AgentTemplate;
    price: number; // 0 for free
    rating: number;
    reviewCount: number;
    tags: string[];
}
