interface locales {
    defaultLang: string;
    defaultJSON: string;
    langs: string[];
    files: string[];
    filesMetadata: {};
}

interface global {
    PROD: boolean;
    locales: locales;
}

interface String {
    encode(lang: string): string;
}

async function sleep(timeout: number): Promise<boolean | void>;