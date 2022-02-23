import { Guild, Member, Message, User } from "eris";
import axios from "axios";
import { CanvasRenderingContext2D, createCanvas } from "canvas";
const moment = require('moment');

export default function start() {

	/* message.deleteAfter(5) */
	//@ts-ignore
	delete Message.prototype.deleteAfter;
	Object.defineProperty(Message.prototype, 'deleteAfter', {
		value: async function (time: number) {
			await sleep(time);
			this.delete().catch(() => { });
		}
	})

	delete Message.prototype.cleanContent
	Object.defineProperty(Message.prototype, 'cleanContent', {
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
	})

	//@ts-ignore
	delete Member.prototype.mute;
	Object.defineProperty(Member.prototype, 'mute', {
		value: async function mutar(args, reason) {
			let regex: RegExp = /([0-9]+)( |)(h|m|s)/gi,
				time: number = Date.now();
			args.match(regex).forEach(t => {
				let bah = Number(t.replace(/[a-z]+/gi, ''))
				if (isNaN(bah)) return;
				if (t.endsWith('h')) return time += bah * 60 * 60 * 1_000;
				if (t.endsWith('m')) return time += bah * 60 * 1_000;
				if (t.endsWith('s')) return time += bah * 1_000;
			})
			let data = await axios({
				"url": `https://${this.user._client.requestHandler.options.domain}${this.user._client.requestHandler.options.baseURL}/guilds/${this.guild.id}/members/${this.user.id}`,
				"headers": {
					"authorization": this.user._client._token,
					"x-audit-log-reason": reason,
					"content-type": "application/json"
				},
				data: {
					"communication_disabled_until": moment(time).format()
				},
				"method": "PATCH"
			})
			if (data.status < 200 || data.status > 300)
				throw new Error(`DiscordRESTError:\nStatus Code: ${data.status}\n${data.statusText}`);
			else return true;
		}
	})

	//@ts-ignore
	// delete Guild.prototype.me;
	// Object.defineProperty(Guild.prototype, 'me', {
	// 	get() {
	// 		return this.members.get(this._client.user.id);
	// 	}
	// })

	/* user.tag */
	//@ts-ignore
	delete User.prototype.tag;
	Object.defineProperty(User.prototype, "tag", {
		get() {
			return `${this.username}#${this.discriminator}`;
		}
	});
	return;
	/** Canvas Structures **/
	//@ts-ignore
	delete CanvasRenderingContext2D.prototype.roundRect;
	Object.defineProperty(CanvasRenderingContext2D.prototype, 'roundRect', {
		value: function roundRect(x, y, width, height, radius, fill, stroke) {
			if (typeof stroke === "undefined") stroke = true;
			if (typeof radius === "undefined") radius = 5;
			if (typeof radius === "number")
				radius = { tl: radius, tr: radius, br: radius, bl: radius };
			else {
				var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
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

	//@ts-ignore
	delete CanvasRenderingContext2D.prototype.roundImageCanvas;
	Object.defineProperty(CanvasRenderingContext2D.prototype, 'roundImageCanvas', {
		value: function roundImageCanvas(img, w = img.width, h = img.height, r = w * 0.5) {
			const canvas = createCanvas(w, h);
			const ctx = canvas.getContext('2d');

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

	//@ts-ignore
	delete CanvasRenderingContext2D.prototype.getLines;
	Object.defineProperty(CanvasRenderingContext2D.prototype, 'getLines', {
		value: function getLines(text, maxWidth) {
			var words = text.split(" ");
			var lines = [];
			var currentLine = words[0];

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