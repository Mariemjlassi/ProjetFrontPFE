import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '63fc3d9a6be2d5f85a3a754d1c9835e8';
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) {}

  getWeather(town: string): Observable<any> {
    const url = `${this.apiUrl}?q=${town}&appid=${this.apiKey}&units=metric`;
    return this.http.get(url);
  }
}
