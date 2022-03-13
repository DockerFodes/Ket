interface locales {
    defaultLang: string;
    defaultJSON: string;
    langs: string[];
    files: string[];
    filesMetadata: {};
}

declare interface global {
    PRODUCTION_MODE: boolean;
    locales: locales;
}

declare interface String {
    encode(lang: string): string;
}

declare async function sleep(timeout: number): Promise<boolean | void>;