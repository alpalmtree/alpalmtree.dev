export default {
    /** @param { string } assetName */
    _asset: (assetName) => {
        return `/resources/${assetName.startsWith("/") ? assetName.slice(1) : assetName}?rel=${Date.now()}`
    }
}