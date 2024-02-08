import { Component } from '@angular/core';
import { Receta } from '../receta';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  recetaEditando = {} as Receta;

  arrayColeccionRecetas: any = [{
    id: "",
    receta: {} as Receta
  }];
  //Selecciona la receta para eliminar
  idrecetaSelec: string = "";


  constructor(private firestoreService: FirestoreService, private router: Router) {
    this.obtenerListarecetas();
  }

  clickBotonInsertar() {

    this.firestoreService.insertar('recetas', this.recetaEditando).then(() => {

      console.log('Receta creada correctamente');
      this.recetaEditando = {} as Receta;
    }, (error) => {
      console.error(error);
    }
    );
  }

  obtenerListarecetas() {
    //Hacer una consulta cada vez que se detectan nuevos datos de la BBDD
    this.firestoreService.consultar("recetas").subscribe((datosRecibidos) => {
      //Limpiar el array para que no se dupliquen los datos anteriores
      this.arrayColeccionRecetas = [];
      //Recorrer rodos los datos recibidos de la BBDD
      datosRecibidos.forEach((datosreceta) => {
        //Cada elemento de la BBDD se almacena en el array que se muestra en pantalla
        this.arrayColeccionRecetas.push({
          id: datosreceta.payload.doc.id,
          receta: datosreceta.payload.doc.data()
        })
      });
    });
  }

  //Función que selecciona una receta
  selecReceta(idreceta: string, recetaSelec: Receta) {
    this.recetaEditando = recetaSelec;
    this.idrecetaSelec = idreceta;
    this.router.navigate(['detalle', this.idrecetaSelec]);
  }

  recetaNueva() {
    this.router.navigate(['detalle', 'nuevo']);
  }


}
