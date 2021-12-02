export {}
const
    { readdirSync } = require('fs'),
    i18next = require('i18next'),
    i18nbackend = require('i18next-node-fs-backend')

module.exports = class LocaleStructure {
    languages: string[]
    ns: string[]
    constructor() {
        this.languages = ["pt", "en", "es"]
        this.ns = ["commands", "events", "permissions"]
    }
    async inicialize() {
        try {
            i18next.use(i18nbackend).init({
                ns: this.ns,
                preload: readdirSync("./src/locales/"),
                fallbackLng: "pt",
                backend: {
                    loadPath: "./src/locales/{{lng}}/{{ns}}.json"
                },
                interpolation: {
                    escapeValue: false
                },
                returnEmptyString: false
            })
        } catch (err) {
            return global.log('error', 'LOCALES MANAGER', "Houve um erro ao carregar os locales", err)
        }
    }
}