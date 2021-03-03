import DataLoader from "dataloader";
import {
    GraphQLInt,
    GraphQLList,
    GraphQLString,
    GraphQLObjectType,
    GraphQLSchema,
} from "graphql";
import {
    fromGlobalId,
    globalIdField,
    nodeDefinitions,
} from 'graphql-relay';

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3600';

function fetchResponseByURL(relativeURL) {
    return fetch(`${BASE_URL}${relativeURL}`).then(res => res.json());
}

function fetchPeople() {
    return fetchResponseByURL('/users/');
}

function fetchId() {
    return fetchResponseByURL('/users/').then(json => json.id);
}

const userLoader = new DataLoader(
    urls => Promise.all(urls.map(fetchId))
);

function fetchfirstName() {
    return fetchResponseByURL('/users/').then(json => json.firstName);
}
function fetchlastName() {
    return fetchResponseByURL('/users/').then(json => json.lastName);
}
function fetchEmail() {
    return fetchResponseByURL('/users/').then(json => json.email);
}
function fetchPermissionLevel() {
    return fetchResponseByURL('/users/').then(json => json.permissionLevel);
}

const { nodeInterface, nodeField } = nodeDefinitions(
    globalId => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'User') {
            return userLoader.load('/users/${id}/');
        }
    },
    object => {
        if (object.hasOwnProperty('id')) {
            return 'User';
        }
    },
);

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'A Person stored in the database',
    fields: () => ({
        firstName: {
            type: GraphQLString,
            resolve: fetchfirstName,
        },
        lastName: {
            type: GraphQLString,
            resolve: fetchlastName,
        },
        email: {
            type: GraphQLString,
            resolve: fetchEmail,
        },
        password: {
            type: GraphQLString,
        },
        permissionLevel: {
            type: GraphQLInt,
            resolve: fetchPermissionLevel,
        },
        id: globalIdField('Person'),
    }),
    interfaces: [ nodeInterface ],
});

const QueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Source of all queries',

    fields: () => ({
        allPeople: {
            type: new GraphQLList(UserType),
            resolve: fetchPeople,
        },
        node: nodeField,
        user: {
            type: UserType,
            args: {
                id: { type: GraphQLString },
            },
            resolve: (root, args) => userLoader.load(`/users/${args.id}/`),
            },
    }),
});

export default new GraphQLSchema({
    query: QueryType,
})
