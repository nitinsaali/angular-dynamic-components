import { Store } from './store';

export 
class Dispatcher {
    // TODO: calls to store should be by events instead of function calls to make this more dynamic and the store *strictly* unidirectional
    dispatch(store: Store, action: string) {
      switch (action) {
        case 'fetch':
          this.getData(store);
        default:
          return store;
      }
    }
  
    private addData(store) {
    };
  
    private getData(store){
        store.getData();
    };
  
    private filterData() {
  
    };
  
    private updateData() {
        return this;
    };
  
    private deleteData() {
        return this;
    };
  }
