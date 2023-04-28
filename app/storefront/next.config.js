const { withStoreConfig } = require("./store-config")
const store = require("./store.config.json")

module.exports = withStoreConfig({
    features: store.features,
    reactStrictMode: true,
    images: {
        domains: ["medusa-public-images.s3.eu-west-1.amazonaws.com", "@ec2-34-242-199-141.eu-west-1.compute.amazonaws.com", "localhost"],
    },
})

console.log("next.config.js", JSON.stringify(module.exports, null, 2))