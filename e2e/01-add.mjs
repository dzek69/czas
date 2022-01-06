import connect from "./00.mjs";
import { Czas, Range } from "../esm/index.js";

(async () => {
    const db = await connect({
        APP_DB_HOST: "127.0.0.1",
        APP_DB_PORT: 27017,
        APP_DB_NAME: "czas",
    });
    console.info("Connected");

    const collection = db.collection("czas");

    const callbacks = {
        async add(config, action, name) {
            const i = await collection.insertOne({
                config,
                action,
                name,
            });
            return i.insertedId;
        }
    }

    const actionRunner = (action, runDate, name) => {
        console.log("running", name, action, "at", Date.now(), "that was planned on", runDate.getTime());
    }

    const czas = new Czas(callbacks, actionRunner);
    // czas.add(Date.now() + 2000, { test: "action" });
    czas.add([
        {
            rule: {
                second: new Range(0, 16, 3),
            },
        },
    ], { action: "test" });
})();
