import mySchema from "./schema/mySchema.js";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import DataLoader from "dataloader";
import fetch from "node-fetch";

const BASE_URL = 'http://localhost:3600';

function getUserByURL(relativeURL) {
    return fetch('${BASE_URL}${relativeURL}')
        .then(res => res.json())
        .then(json => json._id)
}

const app = express();
app.use(`/graphql`, graphqlHTTP(req => {
    const userLoader = new DataLoader(
        keys => Promise.all(keys.map(getUserByURL))
    )
    const loaders = {
            user: userLoader,
        }
        return {
            context: {loaders},
            schema: mySchema,
            graphiql: true,
        }
}));

app.listen(4500, () => {
    console.log('Server is running on port 4500')
});
