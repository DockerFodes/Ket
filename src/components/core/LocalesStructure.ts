import { readdirSync } from "fs";
import i18next from "i18next";
import i18nbackend from "i18next-fs-backend";

module.exports = async function inicialize() {
    try {
        i18next.use(i18nbackend).init({
            ns: ["commands", "events", "permissions"],
            defaultNS: "commands",
            preload: readdirSync(`${global.session.rootDir}/src/locales`),
            fallbackLng: "pt",
            backend: { loadPath: `${global.session.rootDir}/src/locales/{{lng}}/{{ns}}.json` },
            interpolation: {
                escapeValue: false,
                useRawValueToEscape: true
            },
            returnEmptyString: false,
            returnObjects: true
        });
        return global.session.log('shard', 'LOCALES MANAGER', 'Locales carregados');
    } catch (err) {
        return global.session.log('error', 'LOCALES MANAGER', "Houve um erro ao carregar os locales", err);
    }
}