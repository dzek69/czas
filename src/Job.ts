import schedule from "node-schedule";
import { makeArray } from "bottom-line-utils";

import { fixSerializedRule } from "./utils.js";

import type { ActionParam, DateConfig } from "./types";

type RunAction = (action: ActionParam, configuredRunDate: Date, name: string) => void;
type CancelCallback = (job: Job) => void;
type UpdateCallback = (job: Job) => void;

interface CzasCallbacks {
    runAction: RunAction;
    onCancel: CancelCallback;
    onUpdate: UpdateCallback;
}

class Job {
    private readonly _czasCallbacks: CzasCallbacks;

    private _jobs: (schedule.Job | null)[] = [];

    private _action: ActionParam;

    private _lastRun: number = 0;

    private _jobConfig: DateConfig;

    private readonly _id: string;

    private _name: string;

    private _runAction(configuredRunDate: Date) {
        const t = configuredRunDate.getTime();
        if (this._lastRun === t) {
            return; // already run by other rule
        }
        this._lastRun = t;
        this._czasCallbacks.runAction(this._action, configuredRunDate, this._name);
    }

    public constructor(
        jobConfig: DateConfig, action: ActionParam, name: string, id: string, czasCallbacks: CzasCallbacks,
    ) {
        this._id = id;
        this._jobConfig = jobConfig;
        this._action = action;
        this._name = name;
        this._czasCallbacks = czasCallbacks;

        this._scheduleJobs();
    }

    private _scheduleJobs() {
        this._jobs = makeArray(this._jobConfig).map((options) => {
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

    public update(jobConfig: DateConfig, action: ActionParam, name: string) {
        this._jobs.forEach(job => job?.cancel());

        this._jobConfig = jobConfig;
        this._action = action;
        this._name = name;

        this._scheduleJobs();

        this._czasCallbacks.onUpdate(this);
    }

    public cancel() {
        this._jobs.forEach(job => job?.cancel());
        this._jobs = [];
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

    public get name() {
        return this._name;
    }
}

export {
    Job,
};

export type {
    RunAction,
};
