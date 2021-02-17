import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { CoronaService } from '../shared/corona.service';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  showArrows = {
    uparrowState: false,
    downarrowState: false,
    downarrowConfirmed:false,
    uparrowowConfirmed:false,
    downarrowActive:false,
    uparrowActive:false,
    downarrowRecovered:false,
    uparrowRecovered:false,
    downarrowDeath:false,
    uparrowDeath:false,
}


  showDistrict:boolean=false
  sortedDataBasedOnDate
  private isAscendingSort: boolean = false;

  DailystateStatus: Array<any> = [{ state: '', confirmed: '', recovered: '', deaths: '', active: '' }];
  DailyStatus: any = { total: '' }
  statewisedata: Array<any> = [{ state: '', confirmed: '', recovered: '', deaths: '', active: '' }];
  statewisecase: any = { confirmed: '', active: '', recovered: '', deaths: '' }
  startdate = new Date()
  lastupdateddate = new Date();
  lastupdated: any = { hour: 0, minute: 0, second: 0 }
  SingleStateData
  lastrefreshedtime: any;
 
 
  constructor( private cs: CoronaService ) { }

  ngOnInit():void {
    this.getStateWise()
    this.testData()
  }

  testData() {
    this.cs.getDailyCaseStatus().subscribe(
      response => {
        this.sortedDataBasedOnDate = response.data.history
        this.sortByMaxCases(this.sortedDataBasedOnDate)
       
       // console.log(this.sortedDataBasedOnDate);
        this.calculateDiff(this.sortedDataBasedOnDate)
        this.statewisedata = this.sortedDataBasedOnDate[this.sortedDataBasedOnDate.length - 1].statewise
        this.statewisecase= this.sortedDataBasedOnDate[this.sortedDataBasedOnDate.length - 1].total
     //   console.log(this.statewisecase)
      },
      error => {
        console.log(error);
      }
    );
  }

  calculateDiff(data) {
    let x = data
    let last: any = x[x.length - 1];
    let last2: any = x[x.length - 2];

    function calculate(schema1, schema2) {
      var ret = {};
      for (var key in schema1) {
        if (schema1.hasOwnProperty(key) && schema2.hasOwnProperty(key)) {
          var obj = schema1[key];
          var obj2 = schema2[key]
          if (typeof obj === "number" && !isNaN(obj) && typeof obj2 === "number" && !isNaN(obj2)) {
            ret[key] = obj - obj2;
          }
          else {
            if (typeof obj === 'object' && typeof obj2 === 'object') {
              ret[key] = calculate(obj, obj2);
            }
            else {
              ret[key] = obj;
            }
          }
        }
      }
      return ret;
    }
    let test = calculate(last, last2);
    this.DailyStatus = test;
    this.DailystateStatus = this.DailyStatus.statewise
  }







  getStateWise() {
    this.cs.getDataStateWise().subscribe(data => {
    this.lastrefreshedtime=data.data.lastRefreshed   
      this.lastupdateddate = data.data.lastRefreshed
     // console.log(this.lastupdated)

      function getDataDiff(startDate, endDate) {
        var diff = endDate.getTime() - startDate.getTime();
        var days = Math.floor(diff / (60 * 60 * 24 * 1000));
        var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
        var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
        var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
        return { day: days, hour: hours, minute: minutes, second: seconds };
      }

      this.lastupdated = getDataDiff(new Date(this.lastupdateddate), new Date(this.startdate));

    },
      err => {
        console.log(err)
      })
  }

  OngetState(state) {

  this.getDataofState(state)

    this.cs.getState(state)
    this.cs.getDataDistrictWise(state)
 
  }
  getDataofState(state: any) {
   // console.log(this.statewisedata)
   const f = this.statewisedata.filter(a => a.state==state);
    this.SingleStateData=f[0]
    console.log();
  }

  showHideData(data) {
    if(data && data['show'] == true) {
      data['show'] = false;
    } else {
      data['show'] = true;
    }
  }

  sortAscending(data) {
    this.resetArrows()
    this.isAscendingSort = !this.isAscendingSort;
   this.showArrows.uparrowState=!this.showArrows.uparrowState
    
    data.forEach(item => item.statewise.sort(function (a, b) {
      if (a.state < b.state) {
        return -1;
      }
      if (a.state > b.state) {
        return 1;
      }
      return 0;
    }))


    this.calculateDiff(this.sortedDataBasedOnDate)

    if (!this.isAscendingSort) {
      this.resetArrows()
      this.showArrows.downarrowState=!this.showArrows.downarrowState
      let a = data.forEach(item => item.statewise.sort(function (a, b) {
      
      if (b.state < a.state) {
        return -1;
      }
      if (b.state > a.state) {
        return 1;
      }
      return 0;
    }))
      this.calculateDiff(this.sortedDataBasedOnDate)
    }
  }
  resetArrows() {
    this.showArrows = {
      uparrowState: false,
      downarrowState: false,
      downarrowConfirmed:false,
      uparrowowConfirmed:false,
      downarrowActive:false,
      uparrowActive:false,
      downarrowRecovered:false,
      uparrowRecovered:false,
      downarrowDeath:false,
      uparrowDeath:false,
  }
    
  }

  sortByMaxCases(sortedDataBasedOnDate) {
    this.resetArrows()
    this.isAscendingSort = !this.isAscendingSort;
   this.showArrows.downarrowConfirmed=!this.showArrows.downarrowConfirmed


 
    sortedDataBasedOnDate.forEach(item => item.statewise.sort(function (a, b) {
      if (b.confirmed < a.confirmed) {
        return -1;
      }
      if (b.confirmed > a.confirmed) {
        return 1;
      }
      return 0;
    }))
    this.calculateDiff(this.sortedDataBasedOnDate)

    if (!this.isAscendingSort) {
      this.resetArrows()
     this.showArrows.uparrowowConfirmed=!this.showArrows.uparrowowConfirmed
    sortedDataBasedOnDate.forEach(item => item.statewise.sort(function (a, b) {
        if (a.confirmed < b.confirmed) {
          return -1;
        }
        if (a.confirmed > b.confirmed) {
          return 1;
        }
        return 0;
      }))

      this.calculateDiff(this.sortedDataBasedOnDate)
    }
  }

  sortByMaxActive(sortedDataBasedOnDate) {
    this.resetArrows()
    this.isAscendingSort = !this.isAscendingSort;
   this.showArrows.uparrowActive=!this.showArrows.uparrowActive
   
    sortedDataBasedOnDate.forEach(item => item.statewise.sort(function (a, b) {
      if (a.active < b.active) {
        return -1;
      }
      if (a.active > b.active) {
        return 1;
      }
      return 0;
    }))
    this.calculateDiff(this.sortedDataBasedOnDate)

    if (!this.isAscendingSort) {
      this.resetArrows()
     this.showArrows.downarrowActive=!this.showArrows.downarrowActive

      sortedDataBasedOnDate.forEach(item => item.statewise.sort(function (a, b) {
        if (b.active < a.active) {
          return -1;
        }
        if (b.active > a.active) {
          return 1;
        }
        return 0;
      }))
      this.calculateDiff(this.sortedDataBasedOnDate)
    }

  }

  sortByMaxRecovered(sortedDataBasedOnDate) {

    this.resetArrows()
    this.isAscendingSort = !this.isAscendingSort;
   this.showArrows.uparrowRecovered=!this.showArrows.uparrowRecovered
    sortedDataBasedOnDate.forEach(item => item.statewise.sort(function (a, b) {
      if (b.recovered < a.recovered) {
        return -1;
      }
      if (b.recovered > a.recovered) {
        return 1;
      }
      return 0;
    }))
    this.calculateDiff(this.sortedDataBasedOnDate)

    if (!this.isAscendingSort) {

      this.resetArrows()
     this.showArrows.downarrowRecovered=!this.showArrows.downarrowRecovered
      sortedDataBasedOnDate.forEach(item => item.statewise.sort(function (a, b) {
        if (a.recovered < b.recovered) {
          return -1;
        }
        if (a.recovered > b.recovered) {
          return 1;
        }
        return 0;
      }))

      this.calculateDiff(this.sortedDataBasedOnDate)
    }

  }

  sortByMaxDeath(sortedDataBasedOnDate) {
    
    this.resetArrows()
    this.isAscendingSort = !this.isAscendingSort;
   this.showArrows.uparrowDeath=!this.showArrows.uparrowDeath
    sortedDataBasedOnDate.forEach(item => item.statewise.sort(function (a, b) {
     
    if (a.deaths < b.deaths) {
      return -1;
    }
    if (a.deaths > b.deaths) {
      return 1;
    }
    return 0;
  }))
    this.calculateDiff(this.sortedDataBasedOnDate)

    if (!this.isAscendingSort) {
      this.resetArrows()
         this.showArrows.downarrowDeath=!this.showArrows.downarrowDeath
      sortedDataBasedOnDate.forEach(item => item.statewise.sort(function (a, b) {
        if (b.deaths < a.deaths) {
          return -1;
        }
        if (b.deaths > a.deaths) {
          return 1;
        }
        return 0;
      }))
      this.calculateDiff(this.sortedDataBasedOnDate)
    }

  }


  
}

