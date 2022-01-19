import { Job } from "./Job.js";
import type { RunAction } from "./Job.js";
import type { ActionParam, DateConfig, SerializedConfig } from "./types";
import { Range as NSRange } from "node-schedule";

interface Persistence {
    add: (jobConfig: DateConfig, action: ActionParam, name: string) => Promise<string>;
    update: (id: string, jobConfig: DateConfig, action: ActionParam, name: string) => Promise<void>;
    remove: (id: string) => void;
    load?: () => Promise<SerializedConfig[]>;
    onLoad?: () => void;
}

class Czas {
    private _list: Job[] = [];

    private readonly _persistence: Persistence;

    private readonly _runAction: RunAction;

    public constructor(persistence: Persistence, runAction: RunAction) {
        this._persistence = persistence;
        this._runAction = runAction;

        this._init().catch(e => {
            console.error(e); // @TODO better error handling
        });
    }

    private async _init() {
        if (!this._persistence.load) {
            return;
        }

        const list = await this._persistence.load();
        await Promise.all(
            list.map(item => this._add(item.config, item.action, item.name, item.id)),
        );

        this._persistence.onLoad?.();
    }

    private async _add(jobConfig: DateConfig, action: ActionParam, name: string, id?: string) {
        let storedId = id;

        if (!storedId) {
            storedId = await this._persistence.add(jobConfig, action, name);
        }

        const job = new Job(jobConfig, action, name, storedId, {
            runAction: this._runAction,
            onCancel: this._onJobCancel,
            onUpdate: this._onJobUpdate,
        });
        this._list.push(job);
        return job;
    }

    public async add(jobConfig: DateConfig, action: ActionParam, name = "(Unnamed job)") {
        return this._add(jobConfig, action, name);
    }

    private readonly _onJobCancel = (job: Job) => {
        // @TODO first remove from DB, then cancel?
        this._list = this._list.filter(j => j !== job);
        this._persistence.remove(job.id);
    };

    private readonly _onJobUpdate = async (job: Job) => {
        await this._persistence.update(job.id, job.config, job.action, job.name);
    };

    public get list() {
        return [...this._list];
    }
}

export {
    Czas,
    NSRange as Range,
};

export type {
    Persistence,
};
