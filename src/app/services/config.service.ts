import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  backendUrl = environment.backendUrl;
  configsSubject:BehaviorSubject<Map<string,string>> = new BehaviorSubject<Map<string,string>>(new Map());
  loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);


  constructor(private http: HttpClient) { }

  getAllConfigs() {
    this.loadingSubject.next(true);
    return this.http.get<{ [key: string]: string }>(this.backendUrl + 'v1/config').pipe(
      map((response: { [key: string]: string }) => {
        return new Map<string, string>(Object.entries(response));
      }),
      tap((configMap: Map<string, string>) => {
        this.setConfig(configMap);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }


  private setConfig(configs: Map<string,string>) {
    this.configsSubject.next(configs);
  }


  getConfigByKey(key: string) {

  }

  getConfigs(){
    return this.configsSubject.asObservable();
  }

  getLoading() {
    return this.loadingSubject.asObservable();
  }
}
