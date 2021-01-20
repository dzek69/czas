import mdb from "mongodb";

const connect = (env) => {
    const url = "mongodb://" + env.APP_DB_HOST + ":" + env.APP_DB_PORT;

    return new Promise((resolve, reject) => {
        mdb.MongoClient.connect(url, (err, client) => {
            if (err) {
                reject(err);
                return;
            }
            const db = client.db(env.APP_DB_NAME);
            db.ObjectId = mdb.ObjectId;
            resolve(db);
        });
    });
};

export default connect;
