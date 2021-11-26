import { readdirSync } from "fs"
import i18next from "i18next"
import i18nbackend from "i18next-node-fs-backend"

export default class LocaleStructure {
    ket: any
    languages: string[]
    ns: string[]
    constructor(ket) {
        this.ket = ket
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