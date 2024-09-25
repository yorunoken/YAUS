export interface UserGet {
    discord_id: string | "-1";
    short_code: string;
    original_url: string;
    created_at: string;
}

export interface UrlInsert {
    code: string;
}
