/**
 * Api structure of result, to prevent angular from throwing tantrums on two-way binded stuff
 */
export interface ApiResult {
    results: any[],
    queryName: string,
    status: object,
    size: number
}
