import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export declare class SearchHistoryService {
    private pluginDefinition;
    private http;
    private scope;
    private resourcePath;
    private basePlugin;
    private resourceName;
    private uri;
    searchHistory: string[];
    private initHistory;
    private type;
    constructor(pluginDefinition: ZLUX.ContainerPluginDefinition, http: HttpClient);
    onInit(type: string): void;
    private getData;
    private saveData;
    saveSearchHistory(path: string): Observable<any>;
    get searchHistoryVal(): string[];
    deleteSearchHistory(): Observable<any>;
}
