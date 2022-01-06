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
        async load() {
            const list = await collection.find({}).toArray();
            return list.map(i => ({
                ...i,
                id: String(i._id)
            }));
        },
        onLoad() {
            console.log(czas.list)
        }
    }

    const actionRunner = (action, runDate, name) => {
        console.log("running", name, action, "at", Date.now(), "that was planned on", runDate.getTime());
    }

    const czas = new Czas(callbacks, actionRunner);
})();
