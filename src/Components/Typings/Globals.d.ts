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

interface Error {
    stack: string;
    message: string
}

async function sleep(timeout: number): Promise<boolean | void>;