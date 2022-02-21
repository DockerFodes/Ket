declare interface global {
    async sleep(timeout: number): Promise<void>;
    PRODUCTION_MODE: boolean;
    lang: string;
}

declare interface String {
    getT(placeholders?: object, lang?: string): string;
}

declare async function sleep(timeout: number): Promise<void>;