
export interface ViewConfig {
    definition: {
        viewName                : string,
        title                   : string,
        component               : Array<any>,
        style                   : Array<any>
    },
    name                        : string,
    status                      : {
        developerMessage        : string,
        userMessage             : string,
        errors                  : Array<any>,
        statusCode              : number,
        statusMessage           : string
    },
    _links                      : {any}
}
