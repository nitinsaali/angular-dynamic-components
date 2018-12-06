export interface ColumnFieldsInterface {
    "columnName": string,
    "columnDisplayName": string,
    "isVisible": boolean,
    "type": string
}

export interface TableComponentInterface 
{
    "title": string,
    "componentName": string,
    "componentType": string,
    "style": object,
    "isVisible": boolean,
    "showTitle": boolean,
    "columnFields": ColumnFieldsInterface[],
    "endpoint": string,
    "events": object[],
    "store": string,
    "queryName": string,
    "buttons": any[]
}