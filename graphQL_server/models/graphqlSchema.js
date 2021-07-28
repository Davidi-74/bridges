const { buildSchema } = require('graphql')

const schema = buildSchema(`
    type imageType {
        url: String!
        height: Int!
        width: Int!
    }

    type artistType {
        name: String!
        spotifyURL: String!
        followers: Int
        genres: [String]
        href: String!
        id: String!
        images: [imageType]
        popularity: Int
        type: String!
        uri: String!
    }

    type trackType {
        album: albumType
        spotifyURL: String!
        href: String!
        id: String!
        images: [imageType]
        artists: [artistType]
        duration: Int!
        explicit: Boolean!
        isLocal: Boolean!
        name: String!
        popularity: Int
        preview: String!
        uri: String!
    }

    type albumType {
        name: String!
        artists: [artistType]
        spotifyURL: String!
        genres: [String]
        href: String!
        id: String!
        images: [imageType]
        popularity: Int
        releaseDate: String!
        releaseDatePrecision: String!
        tracks: [trackType]
    }

    

    type Mutation {

    }
`)

module.exports = schema;