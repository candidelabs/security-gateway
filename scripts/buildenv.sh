echo \
"CANDIDE_SECURITY_PORT=${CANDIDE_SECURITY_PORT:-3004}
CANDIDE_SECURITY_MONGODB_URL=${CANDIDE_SECURITY_MONGODB_URL:-mongodb://localhost:27017/security}
CANDIDE_SECURITY_OPTIMISM_RPC=${CANDIDE_SECURITY_OPTIMISM_RPC:-https://mainnet.optimism.io}
CANDIDE_SECURITY_GOERLI_RPC=${CANDIDE_SECURITY_GOERLI_RPC:-https://eth-goerli.g.alchemy.com/v2/demo}
CANDIDE_SECURITY_OPTIMISM_GOERLI_RPC=${CANDIDE_SECURITY_OPTIMISM_GOERLI_RPC:-https://goerli.optimism.io}
CANDIDE_SECURITY_FINALIZER_SK=${CANDIDE_SECURITY_FINALIZER_SK}
CANDIDE_SECURITY_SENTRY_DSN=${CANDIDE_SECURITY_SENTRY_DSN}" \
> .env

echo "Env files successfully generated."
