import { blacklistSchema, commandSchema, globalchatSchema, serverSchema, userSchema } from "../../Components/Typings/Modules";
import { CanvasRenderingContext2D, createCanvas, Image } from "canvas";
import Eris, { Client, Collection, Member, Message, User } from "eris";
import { tz } from "moment-timezone";
import table from "../../Packages/Database/_Interaction";
import duration from "moment-duration-format";
import moment from "moment";
import dotenv from "dotenv";
import pg from "pg";

export default function () {
    //@ts-ignore
    duration(moment);
    dotenv.config();
    global.sleep = async (timeout: number) => await (new Promise((res) => setTimeout(() => res(true), timeout)));
    global.PROD = process.argv.includes('--dev') ? false : true;

    console.log = function () {
        let args = [...arguments];


        if (typeof args.slice(-1)[0] !== 'number')
            return console.info(...args);

        moment.locale("pt-BR");

        const sector = args.shift(),
            color = args.pop(),
            text = args.join(' ');

        // sendWebhook(formatLog(sector, text));

        return console.info(formatLog(sector, text, color));
    }

    // function sendWebhook(str: string | string[]) {
    //     const webhookData = process.env.WEBHOOK_LOGS.split(' | ');

    //     if (global.PROD)
    //         (new Client).executeWebhook(webhookData[0], webhookData[1], {
    //             username: `Log`,
    //             avatarURL: "https://cdn.discordapp.com/attachments/788376558271201290/932605381539139635/797062afbe6a08ae32e443277f14b7e2.jpg",
    //             content: String(str).slice(0, 1990).encode('fix')
    //         });
    // }

    function formatLog(sector: string, text: string, color?: number) {
        let array = [];

        if (color)
            array = [ // isso pode parecer meio confuso
                '[', colorize(sector.toUpperCase(), 34), '|', colorize(tz(Date.now(), "America/Sao_Paulo").format("LT"), 33), '|', // mas é só a configuração
                colorize((process.memoryUsage().rss / 1048576).toFixed(2) + 'MB', 32), '] -', colorize(text, color) // do console.log
            ]
        else array = [ // eu achei que assim seria mais fácil de ser lido
            '[', sector.toUpperCase(), '|', tz(Date.now(), "America/Sao_Paulo").format("T"), '|',
            (process.memoryUsage().rss / 1048576).toFixed(2) + 'MB', '] -', text
        ]

        return array.join(' ');  // [ SETOR | 18:04 | 69MB ]
    }

    function colorize(text: string, colorId: number): string {
        return `\x1B[${colorId}m${text}\x1B[0m`;
    }

    console.error = function () {
        return console.log('ANTI-CRASH', 'ERRO GENÉRICO:', String(arguments['0'].stack ? arguments['0'].stack : arguments['0']).slice(0, 512), 31);
    }

    /*		message.deleteAfter(5)		*/
    /*		message.cleanContent		*/
    delete Message.prototype.deleteAfter;
    delete Message.prototype.cleanContent

    Object.defineProperties(Message.prototype, {
        deleteAfter: {
            value: async function (time: number) {
                await sleep(time);
                this.delete().catch(() => { });
            }
        },
        cleanContent: {
            get() {
                let cleanContent = this.content || ""
                cleanContent = cleanContent.replace(new RegExp(`<@!?${this.author.id}>`, "g"), `@\u200b${this.author.username}`);
                if (this.mentions) {
                    this.mentions.forEach((mention) => {
                        if (this.channel.guild) {
                            const member = this.channel.guild.members.get(mention.id);
                            if (member && member.nick)
                                cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), `@\u200b${member.username}`);
                        }
                        cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@\u200b" + mention.username);
                    });
                }

                if (this.channel.guild && this.roleMentions) {
                    for (const roleID of this.roleMentions) {
                        const role = this.channel.guild.roles.get(roleID);
                        cleanContent = cleanContent.replace(new RegExp(`<@&${roleID}>`, "g"), `@\u200b${role ? role.name : "deleted-role"}`);
                    }
                }

                this.channelMentions.forEach((id) => {
                    const channel = this._client.getChannel(id);
                    if (channel && channel.name)
                        cleanContent = cleanContent.replace(`<#${channel.id}>`, `#${channel.name ? channel.name : 'deleted-channel'}`);
                });

                return cleanContent;
            }
        }
    })

    /*		'let ket = new KetClient()'.encode('js')		*/
    delete String.prototype.encode;
    Object.defineProperty(String.prototype, 'encode', {
        value: function (lang: string) {
            return '```' + lang + '\n' + String(this) + '```';
        }
    })

    /*		member.mute()		*/
    // delete Member.prototype.mute;
    // Object.defineProperty(Member.prototype, 'mute', {
    // 	value: async function mutar(time: string, reason: string | null) {
    // 		let data = await axios({
    // 			"url": `https://${this.user._client.requestHandler.options.domain}${this.user._client.requestHandler.options.baseURL}/guilds/${this.guild.id}/members/${this.id}`,
    // 			"headers": {
    // 				"authorization": this.user._client._token,
    // 				"x-audit-log-reason": reason,
    // 				"content-type": "application/json"
    // 			},
    // 			data: {
    // 				"communication_disabled_until": moment(time).format()
    // 			},
    // 			"method": "PATCH"
    // 		})
    // 		if (data.status < 200 || data.status > 300)
    // 			throw new Error(`DiscordRESTError:\nStatus Code: ${data.status}\n${data.statusText}`);
    // 		else return true;
    // 	}
    // })

    /*		user.tag		*/
    delete User.prototype.tag;
    Object.defineProperty(User.prototype, "tag", {
        get() {
            return `${this.username}#${this.discriminator}`;
        }
    });

    /*		PostgresClient		*/
    let tables = ['users', 'servers', 'commands', 'globalchat', 'blacklist'];
    for (let i in tables) delete pg.Client.prototype[tables[i]];
    Object.defineProperty(pg.Client.prototype, 'build', {
        value: async function () {
            Object.defineProperties(pg.Client.prototype, {
                users: {
                    value: new table<userSchema>('users', 'id', this)
                },
                servers: {
                    value: new table<serverSchema>('servers', 'id', this)
                },
                commands: {
                    value: new table<commandSchema>('commands', 'name', this)
                },
                globalchat: {
                    value: new table<globalchatSchema>('globalchat', 'id', this)
                },
                blacklist: {
                    value: new table<blacklistSchema>('blacklist', 'id', this)
                },
                tables: { value: tables }
            })
            await this.connect();
            return;
        }
    })

    /*		ErisClient		*/
    Object.defineProperties(Eris.Client.prototype, {
        commands: { value: new Collection(null, 150) },
        aliases: { value: new Collection(null, 300) },
        webhooks: { value: new Collection(null, 50) },
        shardUptime: { value: new Collection(null, 10) }
    })

    /** Canvas Structures **/
    delete CanvasRenderingContext2D.prototype.roundRect;
    Object.defineProperty(CanvasRenderingContext2D.prototype, 'roundRect', {
        value: function roundRect(x: number, y: number, width: number, height: number, radius, fill, stroke: boolean) {
            if (!stroke) stroke = true;
            if (!radius) radius = 5;
            if (typeof radius === "number")
                radius = { tl: radius, tr: radius, br: radius, bl: radius };
            else {
                let defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
                for (var side in defaultRadius)
                    radius[side] = radius[side] || defaultRadius[side];
            }
            this.beginPath();
            this.moveTo(x + radius.tl, y);
            this.lineTo(x + width - radius.tr, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
            this.lineTo(x + width, y + height - radius.br);
            this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
            this.lineTo(x + radius.bl, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
            this.lineTo(x, y + radius.tl);
            this.quadraticCurveTo(x, y, x + radius.tl, y);
            this.closePath();
            if (fill) this.fill();
            if (stroke) this.stroke();
            return;
        }
    })

    delete CanvasRenderingContext2D.prototype.roundImageCanvas;
    Object.defineProperty(CanvasRenderingContext2D.prototype, 'roundImageCanvas', {
        value: function roundImageCanvas(img: Image, w = img.width, h = img.height, r = w * 0.5) {
            const canvas = createCanvas(w, h);
            const ctx: any = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0, w, h);

            ctx.fillStyle = '#fff';
            ctx.globalCompositeOperation = 'destination-in';
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            return canvas;
        }
    })

    delete CanvasRenderingContext2D.prototype.getLines;
    Object.defineProperty(CanvasRenderingContext2D.prototype, 'getLines', {
        value: function getLines(text: string, maxWidth: number) {
            let words = text.split(" "),
                lines = [],
                currentLine = words[0];

            for (var i = 1; i < words.length; i++) {
                var word = words[i];
                var width = this.measureText(currentLine + " " + word).width;
                if (width < maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        }
    })
}