import { readdirSync } from "fs"
import i18next from "i18next"
import i18nbackend from "i18next-node-fs-backend"

module.exports = class LocaleStructure {
    constructor(ket) {
        this.ket = ket
        this.languages = ["pt", "en", "es"]
        this.ns = ["commands", "events", "permissions"]
    }

    async inicialize() {
        try {
            await this.startLocales()
            return global.log('shard', 'LOCALES MANAGER', 'Locales carregados com sucesso')
        } catch (err) {
            return global.log('error', 'LOCALES MANAGER', "Houve um erro ao carregar os locales", err)
        }
    }

    async startLocales() {
        try {
            i18next.use(i18nbackend).init({
                ns: this.ns,
                preload: await readdirSync("./src/locales/"),
                fallbackLng: "pt",
                backend: {
                    loadPath: "./src/locales/{{lng}}/{{ns}}.json"
                },
                interpolation: {
                    escapeValue: false
                },
                returnEmpyString: false
            })
        } catch (err) {
            return global.log('error', 'LOCALES MANAGER', "Houve um erro ao carregar os locales", err)
        }
    }
}