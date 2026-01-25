require('dotenv').config();

module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'password',
            database: process.env.POSTGRES_DB || 'hackernews',
            port: 5432
        },
        migrations: {
            directory: './src/db/migrations'
        },
        seeds: {
            directory: './src/db/seeds'
        }
    },
    test: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'password',
            database: process.env.POSTGRES_DB_TEST || 'hackernews_test',
            port: 5432
        },
        migrations: {
            directory: './src/db/migrations'
        },
        seeds: {
            directory: './src/db/seeds'
        }
    }
};
