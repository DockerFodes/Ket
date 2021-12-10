export { };
import Eris from "eris";

module.exports.CommandStructure = class CommandStructure {
    ket: any;
    config: object;

    constructor(ket, command) {
        this.config = {
            name: command.name || null,
            aliases: command.aliases || [],
            category: command.category || "util",
            cooldown: command.cooldown || 3,
            permissions: command.permissions || {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: command.access || {
                DM: true,
                Threads: true
            },
            dontType: command.dontType || false,
            testCommand: command.testCommand || [],
            slashData: command.slashData
        }
        this.ket = ket;
    }
    async findUser(message: any, text: string, argsPosition: number) {
        argsPosition = (!argsPosition ? 0 : Number(argsPosition));
        let search: string,
            user: Eris.User;

        if (!Array.isArray(text)) search = text;
        else search = text[argsPosition];

        if (!isNaN(Number(search))) {
            try {
                if (this.ket.users.has(search)) user = this.ket.users.get(search);
                else {
                    user = await this.ket.users.getRESTUser(search);
                    if (!user) user = message.author;
                }
            } catch (e) {
                user = message.author;
            }
        } else {
            try {
                let member: Eris.Member = message.mentions[0] || message.guild.members.find(m => m.user.username.toLowerCase() === search.toLowerCase() || m.displayName.toLowerCase() === search.toLowerCase() || m.user.username.toLowerCase().startsWith(search.toLowerCase()) || m.displayName.toLowerCase().startsWith(search.toLowerCase()) || m.user.username.toLowerCase().includes(search.toLowerCase()) || m.displayName.toLowerCase().includes(search.toLowerCase()));
                user = member.user;
            } catch (e) {
                user = message.author;
            }
        }
        return user;
    }
}

module.exports.EmbedBuilder = class EmbedBuilder {
    fields: object[];
    author: object;
    description: string;
    color: number;
    file: object[];
    footer: object;
    image: any;
    timestamp: any;
    title: string;
    thumbnail: any;
    url: any;

    constructor() {
        this.fields = [];
        this.author = null;
        this.description = null;
        this.color = null;
        this.file = null;
        this.footer = null;
        this.image = null;
        this.timestamp = null;
        this.title = null;
        this.thumbnail = null;
        this.url = null;
    }
    setAuthor(name, icon_url, url = null) {
        this.author = { name, icon_url, url };
        return this;
    }
    setTitle(title) {
        this.title = title;
        return this;
    }
    setDescription(description, code = null) {
        if (code) this.description = `\`\`\`${code}\n${description.toString().substring(0, 3072)}\n\`\`\``;
        else this.description = description.toString().substring(0, 3072);
        return this;
    }
    addField(name, value, inline = false, code = null) {
        if (!name || this.fields.length >= 25) return this;
        if (!value) return false;
        if (code) value = `\`\`\`${code}\n${value.toString().substring(0, 1024)}\n\`\`\``;
        else value = value.toString().substring(0, 1024);
        this.fields.push({ name: name.toString().substring(0, 256), value: value, inline });
        return this;
    }
    addBlankField(inline = false) {
        this.addField('\u200B', '\u200B', inline);
        return this;
    }
    setColor(color: any) {
        const colors = {
            red: "#ff1500",
            orange: "#ff8c00",
            yellow: "#fdff00",
            green: "#25ff00",
            hardgreen: "#0d7200",
            blue: "#2391ff",
            hardblue: "#0025ff",
            hardpurple: "#4b0082",
            purple: "#9400d3",
            pink: "#ff007f",
        };
        if (colors[color]) this.color = parseInt((colors[color]).replace('#', ''), 16);
        else this.color = parseInt((color.replace('#', '')), 16)
        return this;
    }
    setImage(image, height = null, width = null) {
        this.image = {
            url: image
        };
        if (height) this.image.height = height;
        if (width) this.image.width = width;
        return this;
    }
    setTimestamp(timestamp = new Date()) {
        this.timestamp = timestamp;
        return this;
    }
    setUrl(url) {
        this.url = url;
        return this;
    }
    setFooter(text, iconUrl = null) {
        this.footer = {
            text: text.toString().substring(0, 2048),
            icon_url: iconUrl
        };
        return this;
    }
    setThumbnail(url) {
        this.thumbnail = { url };
        return this;
    }
    build() {
        return this;
    }
}
module.exports.Decoration = class Decoration {
    constructor() { };
    getEmoji(emoji: string) {
        let emojis = {
            autorizado: "<:autorizado:765952397595639828>",
            negado: "<:negado:765952453203984404>",
            cristal: "<a:cristal:789542971011104808>",
            carregando: "<a:carregando:765952420575444994>",
            axo: "<a:axo:904961545811951636>",
            sireneBlue: "<a:emergencia2:783149286342787102>",
            sireneRed: "<a:emergencia:770106111381864458>",
            online: '<:online:817023347396706324>',
            idle: '<:idle:817023347723730944>',
            offline: '<:offline:817024931619274762>'
        };
        const emojiFilter = String(emojis[emoji]).replace('<a:', '').replace('<:', '').replace('>', '').trim().split(':')
        const emojiObj = {
            name: emojiFilter[0],
            id: (emojiFilter[1] !== undefined) ? emojiFilter[1] : emojiFilter[0],
            mention: String(emojis[emoji]),
            reaction: (emojiFilter[1] !== undefined) ? `${emojiFilter[0]}:${emojiFilter[1]}` : `${emojiFilter[0]}`
        }
        return emojiObj;
    }
    getColor(color: string, toNumber = true) {
        const colors = {
            red: "#ff1500",
            orange: "#ff8c00",
            yellow: "#fdff00",
            green: "#25ff00",
            hardgreen: "#0d7200",
            blue: "#2391ff",
            hardblue: "#0025ff",
            hardpurple: "#4b0082",
            purple: "#9400d3",
            pink: "#ff007f",
        };
        if (colors[color]) {
            if (toNumber) return parseInt((colors[color]).replace('#', ''), 16);
            return colors[color];
        } else return parseInt((color.replace('#', '')), 16)
    }
}