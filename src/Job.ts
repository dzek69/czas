import schedule from "node-schedule";
import { makeArray } from "bottom-line-utils";

import { fixSerializedRule } from "./utils.js";

import type { ActionParam, DateConfig } from "./types";

type RunAction = (action: ActionParam, configuredRunDate: Date) => void;
type CancelCallback = (job: Job) => void;

interface CzasCallbacks {
    runAction: RunAction;
    onCancel: CancelCallback;
}

class Job {
    private readonly _czasCallbacks: CzasCallbacks;

    private readonly _jobs: (schedule.Job | null)[] = [];

    private readonly _action: ActionParam;

    private _lastRun: number = 0;

    private readonly _jobConfig: DateConfig;

    private readonly _id: string;

    private _runAction(configuredRunDate: Date) {
        const t = configuredRunDate.getTime();
        if (this._lastRun === t) {
            return; // already run by other rule
        }
        this._lastRun = t;
        this._czasCallbacks.runAction(this._action, configuredRunDate);
    }

    public constructor(jobConfig: DateConfig, action: ActionParam, id: string, czasCallbacks: CzasCallbacks) {
        this._id = id;
        this._action = action;
        this._jobConfig = jobConfig;
        this._czasCallbacks = czasCallbacks;

        this._jobs = makeArray(jobConfig).map((options) => {
            if (typeof options === "number") {
                return schedule.scheduleJob(new Date(options), (configuredRunDate) => {
                    this._runAction(configuredRunDate);
                });
            }

            const r = fixSerializedRule(options);
            return schedule.scheduleJob(r.rule, (configuredRunDate) => {
                this._runAction(configuredRunDate);
            });
        });
    }

    public cancel() {
        this._jobs.forEach(job => job?.cancel());
        this._czasCallbacks.onCancel(this);
    }

    public get config() {
        return this._jobConfig; // @todo deep clone
    }

    public get action() {
        return this._action; // @todo deep clone
    }

    public get id() {
        return this._id;
    }
}

export {
    Job,
};

export type {
    RunAction,
};
