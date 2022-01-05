import { Client } from "eris";

export { }
const
	Eris = require('eris'),
	{ EmbedBuilder, Decoration } = require('../Commands/CommandStructure'),
	{ getEmoji } = Decoration,
	{ CanvasRenderingContext2D, createCanvas } = require('canvas');

module.exports = class ProtoTypes {
	ket: Client;
	constructor(ket: Client) {
		this.ket = ket;
	}
	static start() {

		/* message.deleteAfter(5) */
		if (!Eris.Message.prototype.deleteAfter) Object.defineProperty(Eris.Message.prototype, 'deleteAfter', {
			value: function (time) {
				setTimeout(() => this.delete().catch(() => { }), Number(time) * 1000)
			}
		})

		if (!Eris.Message.prototype.filtredContent) Object.defineProperty(Eris.Message.prototype, 'filtredContent', {
			get() {
				let filtredContent = this.content || ""
				filtredContent = filtredContent.replace(new RegExp(`<@!?${this.author.id}>`, "g"), `@\u200b${this.author.username}`);
				if (this.mentions) {
					this.mentions.forEach((mention) => {
						if (this.channel.guild) {
							const member = this.channel.guild.members.get(mention.id);
							if (member && member.nick)
								filtredContent = filtredContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), `@\u200b${member.username}`);
						}
						filtredContent = filtredContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@\u200b" + mention.username);
					});
				}

				if (this.channel.guild && this.roleMentions) {
					for (const roleID of this.roleMentions) {
						const role = this.channel.guild.roles.get(roleID);
						filtredContent = filtredContent.replace(new RegExp(`<@&${roleID}>`, "g"), `@\u200b${role ? role.name : "deleted-role"}`);
					}
				}

				this.channelMentions.forEach((id) => {
					const channel = this._client.getChannel(id);
					if (channel && channel.name)
						filtredContent = filtredContent.replace(`<#${channel.id}>`, `#${channel.name ? channel.name : 'deleted-channel'}`);
				});

				return filtredContent;
			}
		})

		/* user.tag */
		if (!Eris.User.prototype.tag) Object.defineProperty(Eris.User.prototype, "tag", {
			get() {
				return `${this.username}#${this.discriminator}`;
			}
		});

		/** Canvas Structures **/
		if (!CanvasRenderingContext2D.prototype.roundRect) Object.defineProperty(CanvasRenderingContext2D.prototype, 'roundRect', {
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

		if (!CanvasRenderingContext2D.prototype.roundImageCanvas) Object.defineProperty(CanvasRenderingContext2D.prototype, 'roundImageCanvas', {
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

		if (!CanvasRenderingContext2D.prototype.getLines) Object.defineProperty(CanvasRenderingContext2D.prototype, 'getLines', {
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
}