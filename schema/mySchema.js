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

const BASE_URL = 'http://localhost:3600'

function fetchResponseByURL(relativeURL) {
    return fetch(`${BASE_URL}${relativeURL}`).then(res => res.json());
}

function fetchPeople() {
    return fetchResponseByURL('/users/');
}

const { nodeInterface, nodeField } = nodeDefinitions(
    globalId => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'User') {
            return fetchResponseByURL(`/users/${id}/`);
        }
    },
    object => {
        if (object.hasOwnProperty('username')) {
            return 'User';
        }
    },
)

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'A Person stored in the database',
    fields: () => ({
        firstName: {
            type: GraphQLString,
            resolve: person => person.first_name,
        },
        lastName: {
            type: GraphQLString,
            resolve: person => person.last_name,
        },
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        permissionLevel: {type: GraphQLInt},
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
            resolve: (root, args) =>
                    fetchResponseByURL(`/users/${args.id}/`),
            },
    }),
});

export default new GraphQLSchema({
    query: QueryType,
})
