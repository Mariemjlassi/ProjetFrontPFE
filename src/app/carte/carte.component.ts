import { Component, ElementRef, Renderer2, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carte',
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.css'],
  imports: [ CommonModule]
})
export class CarteComponent implements AfterViewInit, OnInit {
  selectedRegion: string = '';
 

  weatherData: any;
  townName: string = '';
  showTown: boolean = false;
  positions: { name: string, latitude: number, longitude: number }[] = [];

  constructor(private http: HttpClient, private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit(): void {
    const storedPositions = localStorage.getItem('positions');
    if (storedPositions) {
      this.positions = JSON.parse(storedPositions);
      this.renderPositions();
    }
  }
  onRegionSelect(region: string) {
    this.selectedRegion = region;
  }
  ngAfterViewInit(): void {
 
    const regions = this.el.nativeElement.querySelectorAll('.region');
    regions.forEach((region: HTMLElement) => {
      this.renderer.listen(region, 'mouseover', () => {
        const town = region.getAttribute('data-name');
        if (town) {
          this.fetchWeather(town);
          this.townName = town;
          this.showTown = true;
        }
      });
      this.renderer.listen(region, 'mouseout', () => {
        this.showTown = false;
      });
    });

    this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      const winWidth = window.innerWidth;
      const townElement = this.el.nativeElement.querySelector('.town');
      if (townElement) {
        if (event.pageX < winWidth / 2) {
          townElement.classList.remove('right');
          townElement.classList.add('left');
          this.renderer.setStyle(townElement, 'top', `${event.pageY - 65}px`);
          this.renderer.setStyle(townElement, 'left', `${event.pageX - 202}px`);
        } else {
          townElement.classList.add('right');
          townElement.classList.remove('left');
          this.renderer.setStyle(townElement, 'top', `${event.pageY - 65}px`);
          this.renderer.setStyle(townElement, 'left', `${event.pageX + 100}px`);
        }
      }
    });
  }

  fetchWeather(town: string): void {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${town}&appid=63fc3d9a6be2d5f85a3a754d1c9835e8&units=metric`;
    this.http.get(url).subscribe((data: any) => {
      this.weatherData = {
        name: data.name,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        humidity: data.main.humidity,
        wind: `${data.wind.speed} km/h`,
        temperature: `${data.main.temp} °C`
      };
      this.onRegionSelect(town); // Mettre à jour la région sélectionnée
      localStorage.setItem('weatherData', JSON.stringify(this.weatherData));
    });
  }

  addPosition(event: Event): void {
    event.preventDefault();
    const name = (document.getElementById('positionName') as HTMLInputElement).value;
    const latitude = parseFloat((document.getElementById('latitude') as HTMLInputElement).value);
    const longitude = parseFloat((document.getElementById('longitude') as HTMLInputElement).value);

    if (name && !isNaN(latitude) && !isNaN(longitude)) {
      this.positions.push({ name, latitude, longitude });
      localStorage.setItem('positions', JSON.stringify(this.positions));
      this.renderPositions();
    }
  }

  renderPositions(): void {
    const mapElement = this.el.nativeElement.querySelector('#map');
    mapElement.querySelectorAll('.position-marker').forEach((marker: HTMLElement) => marker.remove());

    this.positions.forEach(position => {
      const marker = this.renderer.createElement('div');
      this.renderer.addClass(marker, 'position-marker');
      this.renderer.setStyle(marker, 'position', 'absolute');
      this.renderer.setStyle(marker, 'left', `${position.longitude}px`);
      this.renderer.setStyle(marker, 'top', `${position.latitude}px`);
      this.renderer.setProperty(marker, 'innerText', position.name);

      this.renderer.listen(marker, 'click', () => {
        alert(`Position: ${position.name}\nLatitude: ${position.latitude}\nLongitude: ${position.longitude}`);
      });

      this.renderer.appendChild(mapElement, marker);
    });
  }
}