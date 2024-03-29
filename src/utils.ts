import type { OccAny, Occ, Occurence, RecurringConfig, RecurringConfigWithAny } from "./types";
import { Range as NSRange } from "node-schedule";

const fixSerializedParam = (param: OccAny, useIfAny: NSRange): Occ => {
    if (Array.isArray(param)) {
        return param.map(
            p => {
                return fixSerializedParam(p, useIfAny) as Occurence;
            },
        );
    }
    if (typeof param === "number" || param instanceof NSRange) {
        return param;
    }
    if (param === "*") {
        return useIfAny;
    }
    return new NSRange(param.start, param.end, param.step);
};

// eslint-disable-next-line max-statements
const fixSerializedRule = (config: RecurringConfigWithAny): RecurringConfig => {
    const c: RecurringConfigWithAny = {
        ...config,
        rule: {
            ...config.rule,
        },
    };

    if ("second" in c.rule && c.rule.second != null) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        c.rule.second = fixSerializedParam(c.rule.second, new NSRange(0, 59));
    }
    if ("minute" in c.rule && c.rule.minute != null) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        c.rule.minute = fixSerializedParam(c.rule.minute, new NSRange(0, 59));
    }
    if ("hour" in c.rule && c.rule.hour != null) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        c.rule.hour = fixSerializedParam(c.rule.hour, new NSRange(0, 23));
    }
    if ("date" in c.rule && c.rule.date != null) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        c.rule.date = fixSerializedParam(c.rule.date, new NSRange(0, 31));
    }
    if ("month" in c.rule && c.rule.month != null) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        c.rule.month = fixSerializedParam(c.rule.month, new NSRange(0, 12));
    }
    if ("year" in c.rule && c.rule.year != null) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        c.rule.year = fixSerializedParam(c.rule.year, new NSRange(2020, 2100));
        // ^ yes, this will break in 2100, but my grandson will update this I guess
        // this is because I don't want to slow things down for no reason :)
    }
    if ("dayOfWeek" in c.rule && c.rule.dayOfWeek != null) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        c.rule.dayOfWeek = fixSerializedParam(c.rule.dayOfWeek, new NSRange(0, 6));
    }

    return c as RecurringConfig;
};

export { fixSerializedRule };
