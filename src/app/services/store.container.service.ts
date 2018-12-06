import { Injectable } from "@angular/core";
import { Store as FluxStore, Store } from '../classes/store'

@Injectable()
export class StoreContainer {
    private stores: FluxStore[];
    constructor () {}

    getStore(name: string): FluxStore {
        const stores = this.stores;
        return stores.find((store) => {
            return store.name === name;
        });
    }

    getAll(): FluxStore[] {
        return this.stores;
    }

    saveStore(stores: FluxStore[]) {
        this.stores = stores;
    }
}