declare interface global {
    sleep(timeout: number): void;
    PRODUCTION_MODE: boolean;
    lang: string;
}

declare interface String {
    getTranslation(placeholders?: object, lang?: string): string;
}

declare function sleep(timeout: number): void;