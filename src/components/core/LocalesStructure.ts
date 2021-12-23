export { };
const
    { readdirSync } = require('fs'),
    i18next = require('i18next'),
    i18nbackend = require('i18next-fs-backend');

module.exports = async function inicialize() {
    try {
        i18next.use(i18nbackend).init({
            ns: ["commands", "events", "permissions"],
            defaultNS: "commands",
            preload: readdirSync(`${global.client.dir}/src/locales`),
            fallbackLng: "pt",
            backend: { loadPath: `${global.client.dir}/src/locales/{{lng}}/{{ns}}.json` },
            interpolation: {
                escapeValue: false,
                useRawValueToEscape: true
            },
            returnEmptyString: false,
            returnObjects: true
        });
        return global.client.log('shard', 'LOCALES MANAGER', 'Locales carregados');
    } catch (err) {
        return global.client.log('error', 'LOCALES MANAGER', "Houve um erro ao carregar os locales", err);
    }
}