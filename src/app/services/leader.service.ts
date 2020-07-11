import { Injectable } from '@angular/core';
import { Leader } from '../shared/leader';
import { LEADERS } from '../shared/leaders';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { baseURL } from '../shared/baseurl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProcessHTTPMsgService } from '../services/process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderService {
  getLeaders(): Observable<Leader[]> {
    return this.http.get<Leader[]>(baseURL + "leadership")
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getFeaturedLeader(): Observable<Leader> {
    return this.http.get<Leader[]>(baseURL + "leadership?featured=true").pipe(map(LEADERS => LEADERS[0])).pipe(catchError(this.processHTTPMsgService.handleError));
  }
    constructor(private http: HttpClient,
      private processHTTPMsgService: ProcessHTTPMsgService) { }
}
