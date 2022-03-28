import { getEmoji } from "../Commands/CommandStructure";

class LocalesStructure {
    lang: string;
    constructor(lang: string) {
        this.lang = lang;
    }

    getLocale(str: string, placeholders?: object, language?: string): string {
        // declarando variáveis individuais para evitar usar global.{value} toda hora
        let { filesMetadata, defaultLang, defaultJSON } = global.locales;

        try {
            let JSON_DATA = filesMetadata[language || this.lang][str.includes(':') ? str.split(':')[0] : defaultJSON];
            // procurando no json de traduções o objeto especificado (no idioma fornecido)
            if (!JSON_DATA) JSON_DATA = filesMetadata[defaultLang][str.includes(':') ? str.split(':')[0] : defaultJSON];
            // se aquela string não existir naquele idioma, pegue do idioma principal

            let content = this.getValue(JSON_DATA, str.includes(':') ? str.split(':')[1] : str);
            if (!JSON_DATA || !content) return str;

            const filtrar = (ctt: string) => {
                if (!placeholders) return ctt;

                Object.entries(placeholders).forEach(([key, value]) => {

                    (ctt.match(new RegExp(`{{(${key}|${key}.*?)}}`, 'g')) || []) // regex pra encontrar placeholders
                        .map(a => a.replace(new RegExp('{{|}}', 'g'), '')) // removendo as chaves
                        .forEach((m: string) => {
                            let newStr = String(this.getValue(placeholders, m));

                            if (m.includes('.') && !!newStr) ctt = ctt.replace(`{{${m}}}`, newStr);
                            else typeof value !== 'object' ? ctt = ctt.replace(`{{${m}}}`, value) : null;
                        });
                });

                (ctt.match(new RegExp('#emoji\\([a-z]*\\)', 'gi')) || [])
                    .forEach((m) =>
                        ctt = ctt
                            .replace(m, getEmoji(
                                m.replace('#emoji(', '').replace(')', '')
                            ).mention)
                    );

                return ctt;
            }

            return typeof content === 'object'
                ? JSON.parse(filtrar(JSON.stringify(content)))
                : filtrar(content);

        } catch (e) {
            return str;
        }
    }

    getValue(obj: object, str: string) {
        // obtendo um valor do objeto atravéz de uma string;
        return str.split('.')
            .reduce((object, key) => object[key], obj);
    }

}

export default function getT(lang: string) {
    let locales = new LocalesStructure(lang);
    return locales.getLocale.bind(locales);
}