export default {
    /** @param { string } assetName */
    asset: (assetName) => {
        return `/resources/${assetName.startsWith("/") ? assetName.slice(1) : assetName}?rel=${Date.now()}`
    },
    css: (fileName) => {
        return /*html*/`
            <link rel="stylesheet" href="/resources/css/${fileName.startsWith("/") ? fileName.slice(1) : fileName}.css?rel=${Date.now()}">
        `
    },
     js: (fileName) => {
        return /*html*/`
            <script type="module" src="/resources/js/${fileName.startsWith("/") ? fileName.slice(1) : fileName}.js?rel=${Date.now()}"></script>
        `
    },
    component: (componentName) => {
        return /*html*/`
            <link rel="stylesheet" href="/resources/components/${componentName}/component.css?rel=${Date.now()}">
            <script type="module" src="/resources/components/${componentName}/component.js?rel=${Date.now()}"></script>
        `
    }
}