import type { Range } from "node-schedule";

interface SerializedRange {
    start?: number;
    end?: number;
    step?: number;
}

type Occurence = number | Range;
type Occ = Occurence | Occurence[];

type OccurenceWithAny = Occurence | "*" | SerializedRange;
type OccAny = OccurenceWithAny | OccurenceWithAny[];

interface RuleWithAny {
    second?: OccAny;
    minute?: OccAny;
    hour?: OccAny;
    date?: OccAny;
    month?: OccAny; // 0 - 11
    year?: OccAny;
    dayOfWeek?: OccAny; // 0 - 6, 0 = Sunday
}

interface Rule {
    second?: Occ;
    minute?: Occ;
    hour?: Occ;
    date?: Occ;
    month?: Occ; // 0 - 11
    year?: Occ;
    dayOfWeek?: Occ; // 0 - 6, 0 = Sunday
}

interface RecurringConfigWithAny {
    rule: RuleWithAny;
    start?: number;
    end?: number;
}

interface RecurringConfig extends RecurringConfigWithAny {
    rule: Rule;
}

type SingleDateConfig = number;

type OneConfig = RecurringConfigWithAny | SingleDateConfig;
type DateConfig = OneConfig | OneConfig[];

type Action = Record<string, unknown>;
type ActionParam = Action | Action[];

interface SerializedConfig {
    config: DateConfig;
    action: ActionParam;
    id: string;
}

export type {
    RecurringConfigWithAny,
    RecurringConfig,
    SingleDateConfig,
    Occurence,
    Occ,
    OccurenceWithAny,
    OccAny,
    DateConfig, Action, ActionParam,
    SerializedConfig,
};
