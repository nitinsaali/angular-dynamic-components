export interface MainUi <Object> {
    "main-ui": {
        "id": string,
        "class": Array<any>,
        "name": string,
        "org": string,
        "style": object,
        "layoutType": string,
        "menu": [
            {
                "name": string,
                "href": string,
                "getUrl": string
            },
            {
                "name": string,
                "href": string
            }
        ],
        "sidebar": "",
        "view": Array<any>
    }
}
