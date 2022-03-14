class Locales {
    lang: string;
    constructor(lang: string) {
        this.lang = lang;
    }
    getString(str: string, placeholders?: object, language?: string): string {
        try {
            const data = global.locales.filesMetadata[language || this.lang || global.locales.defaultLang][str.includes(':') ? str.split(':')[0] : global.locales.defaultJSON];
            let content = data[str.includes(':') ? str.split(':')[1] : str];
            if (!data || !content) return str;

            let filtrar = (ctt: string) => {
                if (!placeholders) return ctt;
                Object.entries(placeholders).forEach(([key, value]) => {
                    let regex: RegExp = eval(`/{{(${key}|${key}.*?)}}/g`);
                    ctt.match(regex).map(a => a.replace(new RegExp('{{|}}', 'g'), '')).forEach((match: string) => {
                        let ph = placeholders[match.split('.')[0]][match.split('.')[1]];
                        if (match.includes('.') && ph) ctt = ctt.replace(`{{${match}}}`, ph);
                        else typeof value !== 'object' ? ctt = ctt.replace(`{{${match}}}`, value) : null;
                    });
                });
                return ctt;
            }

            return typeof content === 'object'
                ? JSON.parse(filtrar(JSON.stringify(content)))
                : filtrar(content);
        } catch (_e: unknown) {
            return str;
        }
    }
}

export default function getT(lang: string) {
    return new Locales(lang).getString;
}