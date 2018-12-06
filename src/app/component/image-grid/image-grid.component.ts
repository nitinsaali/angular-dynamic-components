import { Component, OnInit } from '@angular/core';

import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss']
})
export class ImageGridComponent implements OnInit {
  public products = {};
  
  constructor(private http: HttpService) { }

  ngOnInit() {
    // let params = {
    //   "getUrl": "http://78.129.190.89:8091/api/search/boxchain_demo_a_product_elastic_projection/_search", 
    //   "payload": {
    //       "query": {
    //           "match": {
    //           "_type": "demoAProduct"
    //           }
    //       }
    //   }
    // };
    // this.http.getData(params).subscribe(
    //   (data: any) => {
    //     console.log(`fetched data:`, data);
    //     this.products = data.hits;
    //   }
    // );
  }

}
