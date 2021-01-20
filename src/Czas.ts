import { Job } from "./Job.js";
import type { RunAction } from "./Job.js";
import type { ActionParam, DateConfig, SerializedConfig } from "./types";
import { Range } from "node-schedule";

interface Persistence {
    add: (jobConfig: DateConfig, action: ActionParam) => Promise<string>;
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
            // eslint-disable-next-line @typescript-eslint/promise-function-async
            list.map(item => this._add(item.config, item.action, item.id)),
        );

        this._persistence.onLoad?.();
    }

    private async _add(jobConfig: DateConfig, action: ActionParam, id?: string) {
        let storedId = id;

        if (!storedId) {
            storedId = await this._persistence.add(jobConfig, action);
        }

        const job = new Job(jobConfig, action, storedId, {
            runAction: this._runAction,
            onCancel: this._onJobCancel,
        });
        this._list.push(job);
        return job;
    }

    public async add(jobConfig: DateConfig, action: ActionParam) {
        return this._add(jobConfig, action);
    }

    private readonly _onJobCancel = async (job: Job) => {
        // @TODO first remove from DB, then cancel?
        this._list = this._list.filter(j => j !== job);
        this._persistence.remove(job.id);
    };

    public get list() {
        return [...this._list];
    }
}

export {
    Czas,
    Range,
};

export type {
    Persistence,
};
