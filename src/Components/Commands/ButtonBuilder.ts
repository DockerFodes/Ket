import { ComponentInteractionButtonData, InteractionButton } from "eris";

export default class Button {
    emoji: { name: string, id: string };
    label: string;
    style: 2 | 1 | 3 | 4;
    disabled: boolean;
    url: string;
    id: string;
    constructor() {
        this.emoji = null;
        this.label = null;
        this.style = 2;
        this.disabled = false;
        this.url = '';
        this.id = null;
    }

    setEmoji(emoji) {
        this.emoji = null;
        return this;
    }

    setLabel(label) {
        this.label = label;
        return this;
    }

    customID(id) {
        this.id = id;
        return this;
    }

    setURL(url) {
        this.url = url;
        return this;
    }

    setStatus(status) {
        this.disabled = status;
        return this;
    }

    /**
       *
       * @param {*} id
       * @returns
       *
       * ## Examples

      *| Name      | Value | Color                    | Required Field |
      *| --------- | ----- | ------------------------ | -------------- |
      *| Primary   | 1     | blurple                  | `custom_id`    |
      *| Secondary | 2     | grey                     | `custom_id`    |
      *| Success   | 3     | green                    | `custom_id`    |
      *| Danger    | 4     | red                      | `custom_id`    |
      *| Link      | 5     | grey, navigates to a URL | `url`          |
          * *  Credits: **https://discord.com/developers/docs/interactions/message-components#buttons-button-styles**
          *
      *
      *
      */
    setStyle(id) {
        this.style = id;
        return this;
    }

    build() {
        return this;
    }

    data() {
        const button: any = {};
        button.type = 2;
        if (typeof this.emoji === 'string') button.emoji = this.emoji;
        if (typeof this.id === 'string') button.custom_id = this.id;
        if (typeof this.label === 'string') button.label = this.label;
        if (typeof this.style === 'number') button.style = this.style;
        if (typeof this.disabled === 'boolean') button.disabled = this.disabled;
        if (typeof this.url === 'string') button.url = this.url;

        return button;
    }
}
