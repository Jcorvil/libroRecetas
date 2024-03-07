import { Component, OnInit } from '@angular/core';

import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';

import * as L from 'leaflet';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  constructor(private callNumber: CallNumber) { }

  ngOnInit() { }

  llamadaTel(): void {
    const phoneNumber = '603551622';
    this.callNumber
      .callNumber(phoneNumber, true)
      .then(() => console.log('Llamando...'))
      .catch((error) => console.log('Error al iniciar la llamada', error));
  }

  map: any;

  ionViewDidEnter() {
    this.loadMap();
  }

  loadMap() {
    let latitud = 36.6797047;
    let longitud = -5.4470656;
    let zoom = 17;
    this.map = L.map("mapId").setView([latitud, longitud], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(this.map);
  }

}
