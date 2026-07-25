export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    appSettings?: {
        app_name?: string;
        app_tagline?: string;
        app_logo?: string;
        primary_color?: string;
        secondary_color?: string;
        accent_color?: string;
        footer_text?: string;
        welcome_title?: string;
        welcome_subtitle?: string;
    };
};
