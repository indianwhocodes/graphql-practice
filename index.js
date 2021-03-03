import mySchema from "./schema/mySchema.js";
import express from "express";
import { graphqlHTTP } from "express-graphql";

const app = express();
app.use(`/graphql`, graphqlHTTP({
        schema: mySchema,
        graphiql: true
}));

app.listen(4500, () => {
    console.log('Server is running on port 4500')
});
