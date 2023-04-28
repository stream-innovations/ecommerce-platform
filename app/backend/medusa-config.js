const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
    case "production":
        ENV_FILE_NAME = ".env.production";
        break;
    case "staging":
        ENV_FILE_NAME = ".env.staging";
        break;
    case "test":
        ENV_FILE_NAME = ".env.test";
        break;
    case "development":
    default:
        ENV_FILE_NAME = ".env";
        break;
}

try {
    dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
    process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001,https://admin.streampay.store";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000,https://streampay.store";

const DATABASE_TYPE = process.env.DATABASE_TYPE || "postgres";
const DATABASE_URL = process.env.DATABASE_URL || "postgres://kgrmuxquudpcaj:951bd56470623bd4eacd11f2a9cf4272ad597a4db5de1a46c94d20de91d117a2@ec2-34-242-199-141.eu-west-1.compute.amazonaws.com:5432/d8nregtsnbqmta";
const REDIS_URL = process.env.REDIS_URL || "redis://default:vLugHO8x4jxAKK4UJ9KdQVwOc3RhEBmLYEKBP3UjpIBFBnEY5gR8b1w0trTkvNuo@ktlvy4.stackhero-network.com:6379";

// Stripe keys
const STRIPE_API_KEY = process.env.STRIPE_API_KEY || "pk_live_51Mo3EsC9zewCO3jA9a7MYLlcammdBTAgOg7kFPiFERhkjIAsOQ2aFCEJDioGlOqON1HvLj9ZafyA2TomrjJDTL6J00BkwL6FNG";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "we_1Mo3YcC9zewCO3jAM0pDVf1B";

const plugins = [
    `medusa-fulfillment-manual`,
    `medusa-payment-manual`,
    // To enable the admin plugin, uncomment the following lines and run `yarn add @medusajs/admin`
    // Please note is not recommended to build the admin in production, cause a minimum of 2GB RAM
    // is required.
    {
        resolve: "@medusajs/admin",
        /** @type {import('@medusajs/admin').PluginOptions} */
        options: {
            autoRebuild: false,
        },
    },
    {
        resolve: `medusa-payment-stripe`,
        options: {
            api_key: STRIPE_API_KEY,
            webhook_secret: STRIPE_WEBHOOK_SECRET,
            automatic_payment_methods: true,
        },
    },
    {
        resolve: `medusa-file-minio`,
        options: {
            endpoint: process.env.MINIO_ENDPOINT,
            bucket: process.env.MINIO_BUCKET,
            access_key_id: process.env.MINIO_ACCESS_KEY,
            secret_access_key: process.env.MINIO_SECRET_KEY,
        },
    },
    {
        resolve: `medusa-plugin-sendgrid`,
        options: {
            api_key: process.env.SENDGRID_API_KEY,
            from: process.env.SENDGRID_FROM,
            order_placed_template: process.env.SENDGRID_ORDER_PLACED_ID,
            localization: {
                "en-EN": { // locale key
                    order_placed_template: process.env.SENDGRID_ORDER_PLACED_ID_LOCALIZED,
                }
            }
        }
    },
    {
        resolve: `medusa-plugin-meilisearch`,
        options: {
            // other options...
            settings: {
                products: {
                    indexSettings: {
                        searchableAttributes: [
                            "title",
                            "description",
                            "variant_sku",
                        ],
                        displayedAttributes: [
                            "title",
                            "description",
                            "variant_sku",
                            "thumbnail",
                            "handle",
                        ],
                    },
                    primaryKey: "id",
                    transform: (product) => ({
                        id: product.id,
                        // other attributes...
                    }),
                },
            },
        },
    },
];

const modules = {
    eventBus: {
        resolve: "@medusajs/event-bus-redis",
        options: {
            redisUrl: REDIS_URL
        }
    },
    cacheService: {
        resolve: "@medusajs/cache-redis",
        options: {
            redisUrl: REDIS_URL
        }
    },
}

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
    jwtSecret: process.env.JWT_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    database_database: "./medusa-db.sql",
    database_type: DATABASE_TYPE,
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    // Uncomment the following lines to enable REDIS
    redis_url: REDIS_URL
}

if (DATABASE_URL && DATABASE_TYPE === "postgres") {
    projectConfig.database_url = DATABASE_URL;
    delete projectConfig["database_database"];
}


/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
    projectConfig: {
        redis_url: REDIS_URL,
        database_url: DATABASE_URL,
        database_type: "postgres",
        store_cors: STORE_CORS,
        admin_cors: ADMIN_CORS,
        database_extra: process.env.NODE_ENV !== "development" ? { ssl: { rejectUnauthorized: false } } : {},
    },
    plugins,
}