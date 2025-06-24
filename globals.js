export default {
    /** @param { string } assetName */
    asset: (assetName) => {
        return `/resources/${assetName.startsWith("/") ? assetName.slice(1) : assetName}?rel=${Date.now()}`
    }
}