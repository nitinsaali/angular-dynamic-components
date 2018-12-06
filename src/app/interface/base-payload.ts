// {"queryName":"category_search","query": {
//     "parameters":[{"name":"status",
//     "value":"Active"}],
//    "pageNo" : "1",
//    "pageSize" : "50",
//    "sort" : ""
// }}
export interface BaseQueryPayload {
    "queryName": string,
    "query": {
        "parameters": Array<{"name": string, "value": string}>,
        "pageNo": string,
        "pageSize": string,
        "sort": string
    }
}

export interface BaseCommandPayload {
    "org": string,
    "commandName": string,
    "solutionName": string,
    "payload": object,
}