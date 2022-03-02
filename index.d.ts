declare interface global {
    PRODUCTION_MODE: boolean;
    lang: string;
}


declare interface String {
    getT(placeholders?: object, lang?: string): string;
    encode(lang: string): string;
}

declare async function sleep(timeout: number): Promise<boolean | void>;