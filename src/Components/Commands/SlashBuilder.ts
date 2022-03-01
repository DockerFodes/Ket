import { CommandOptions } from "eris";

export default class CommandBase {
    name: string;
    description: string;
    options: CommandOptions[];
    channelTypes: number;
    maxValue: number;
    minValue: number;
    type: number;
    defaultPermission: boolean;
    applicationID: string;
    id: string;

    constructor() {
        this.name = '';
        this.description = '';
        this.options = [];
        this.type = 1;
        this.defaultPermission = true;
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    addOptions(...options) {
        for (const optionsElement of options) {
            // if (optionsElement instanceof CommandOptions) {
            this.options.push(optionsElement);
            // }
        }
        return this;
    }

    get data() {
        const data = {
            name: this.name,
            description: this.description,
            options: []
        };
        if (this.options && this.options.length > 0) data.options = this.options;
        return data;
    }

    setChannelType(type) {
        this.channelTypes = type;
        return this;
    }

    setMaxValue(value) {
        this.maxValue = value;
        return this;
    }
    setMinValue(value) {
        this.minValue = value;
        return this;
    }

    setType(type: number) {
        this.type = type;
        return this;
    }

    get toJSON() {
        let data: any = {
            id: this.id,
            application_id: this.applicationID,
            name: this.name,
            description: this.description,
            default_permission: this.defaultPermission
        };

        if (this.maxValue) data.max_value = this.maxValue;
        if (this.maxValue) data.min_value = this.minValue;
        if (this.channelTypes) data.channel_types = this.channelTypes;

        if (this.options && this.options.length > 0) data.options = this.options;

        return data;
    }


}