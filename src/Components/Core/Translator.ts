import axios from "axios";

class TranslateAPI {
    languages: object;
    baseURL: string;
    constructor() {
        this.baseURL = "https://translate.googleapis.com/translate_a/single";
        this.languages = {
            "auto": "Automatic",
            "af": "Afrikaans",
            "sq": "Albanian",
            "am": "Amharic",
            "ar": "Arabic",
            "hy": "Armenian",
            "az": "Azerbaijani",
            "eu": "Basque",
            "be": "Belarusian",
            "bn": "Bengali",
            "bs": "Bosnian",
            "bg": "Bulgarian",
            "ca": "Catalan",
            "ceb": "Cebuano",
            "ny": "Chichewa",
            "zh-cn": "Chinese Simplified",
            "zh-tw": "Chinese Traditional",
            "co": "Corsican",
            "hr": "Croatian",
            "cs": "Czech",
            "da": "Danish",
            "nl": "Dutch",
            "en": "English",
            "eo": "Esperanto",
            "et": "Estonian",
            "tl": "Filipino",
            "fi": "Finnish",
            "fr": "French",
            "fy": "Frisian",
            "gl": "Galician",
            "ka": "Georgian",
            "de": "German",
            "el": "Greek",
            "gu": "Gujarati",
            "ht": "Haitian Creole",
            "ha": "Hausa",
            "haw": "Hawaiian",
            "iw": "Hebrew",
            "hi": "Hindi",
            "hmn": "Hmong",
            "hu": "Hungarian",
            "is": "Icelandic",
            "ig": "Igbo",
            "id": "Indonesian",
            "ga": "Irish",
            "it": "Italian",
            "ja": "Japanese",
            "jw": "Javanese",
            "kn": "Kannada",
            "kk": "Kazakh",
            "km": "Khmer",
            "ko": "Korean",
            "ku": "Kurdish (Kurmanji)",
            "ky": "Kyrgyz",
            "lo": "Lao",
            "la": "Latin",
            "lv": "Latvian",
            "lt": "Lithuanian",
            "lb": "Luxembourgish",
            "mk": "Macedonian",
            "mg": "Malagasy",
            "ms": "Malay",
            "ml": "Malayalam",
            "mt": "Maltese",
            "mi": "Maori",
            "mr": "Marathi",
            "mn": "Mongolian",
            "my": "Myanmar (Burmese)",
            "ne": "Nepali",
            "no": "Norwegian",
            "ps": "Pashto",
            "fa": "Persian",
            "pl": "Polish",
            "pt": "Portuguese",
            "pa": "Punjabi",
            "ro": "Romanian",
            "ru": "Russian",
            "sm": "Samoan",
            "gd": "Scots Gaelic",
            "sr": "Serbian",
            "st": "Sesotho",
            "sn": "Shona",
            "sd": "Sindhi",
            "si": "Sinhala",
            "sk": "Slovak",
            "sl": "Slovenian",
            "so": "Somali",
            "es": "Spanish",
            "su": "Sundanese",
            "sw": "Swahili",
            "sv": "Swedish",
            "tg": "Tajik",
            "ta": "Tamil",
            "te": "Telugu",
            "th": "Thai",
            "tr": "Turkish",
            "uk": "Ukrainian",
            "ur": "Urdu",
            "uz": "Uzbek",
            "vi": "Vietnamese",
            "cy": "Welsh",
            "xh": "Xhosa",
            "yi": "Yiddish",
            "yo": "Yoruba",
            "zu": "Zulu"
        }
    }

    public async translate(content: string, to: string = 'en', from: string = 'auto') {
        content = encodeURI(content);
        from = this.getISO(from);
        to = this.getISO(to);

        let query = {
            client: 'gtx',
            sl: from,
            tl: to,
            hl: to,
            dt: ["at", "bd", "ex", "ld", "md", "qca", "rw", "rm", "ss", "t"],
            ie: "UTF-8",
            oe: "UTF-8",
            otf: 1,
            ssel: 0,
            tsel: 0,
            kc: 7,
            q: content
        },
            url = `${this.baseURL}?${this.addScopes(query)}`;

        let req: unknown = {
            url,
            method: 'GET'
        };
        if (url.length > 2048) {
            delete query.q;
            req = {
                url: `${this.baseURL}?${this.addScopes(query)}`,
                method: "POST",
                form: { q: content }
            };
        }

        let data = (await axios(req)).data

        let result = {
            text: "",
            from: {
                language: {
                    didYouMean: false,
                    iso: ""
                },
                text: {
                    autoCorrected: false,
                    value: "",
                    didYouMean: false
                }
            }
        };

        let body = JSON.parse(JSON.stringify(data));
        body[0].forEach((obj) => obj[0] ? result.text += obj[0] : null);

        if (body[2] === body[8][0][0]) result.from.language.iso = body[2];
        else {
            result.from.language.didYouMean = true;
            result.from.language.iso = body[8][0][0];
        }

        if (body[7] && body[7][0]) {
            result.from.text.value = body[7][0]
                .replace(/<b><i>/g, "[")
                .replace(/<\/i><\/b>/g, "]")
                .replace(new RegExp('&quot;', 'g'), '');

            if (body[7][5] === true) result.from.text.autoCorrected = true;
            else result.from.text.didYouMean = true;
        }
        return result;
    }

    public addScopes(obj) {
        let res = '';
        Object.entries(obj).forEach(([key, value]) => {
            if (Array.isArray(value)) return value.forEach((v) => res += `&${key}=${v}`);
            res += `&${key}=${value}`;
        })
        return res;
    }

    public getISO(lang: string) {
        lang = String(lang).toLowerCase();
        if (this.languages[lang]) return lang;

        let keys = Object.keys(this.languages).filter((key) => {
            if (typeof this.languages[key] !== "string") return false;

            return this.languages[key].toLowerCase() === lang;
        });

        return String(keys[0]);
    }

    getLanguage(lang: string) {
        if (this.languages[String(lang).toLowerCase()]) return this.languages[String(lang).toLowerCase()];
    }
}

let Translator = (new TranslateAPI());
export default Translator;