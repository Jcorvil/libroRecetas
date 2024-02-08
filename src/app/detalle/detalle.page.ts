import { Component, OnInit } from '@angular/core';
import { Receta } from '../receta';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { AlertController } from '@ionic/angular';
import { LoadingController, ToastController } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';


@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  id: string = "";

  recetaEditando = {} as Receta;

  creandoNuevaReceta: boolean = false;

  document: any = {
    id: "",
    data: {} as Receta
  };

  constructor(private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService,
    public alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private imagePicker: ImagePicker) { }

  ngOnInit() {
    // Se almacena en una variable el id que se ha recibido desde la página anterior
    let idRecibido = this.activatedRoute.snapshot.paramMap.get('id');
    if (idRecibido != null) {
      this.id = idRecibido;

      if (this.id == 'nuevo') {
        this.creandoNuevaReceta = true;
      } else {

        // Se hace la consulta a la base de datos para obtener los datos asociados a esa id
        this.firestoreService.consultarPorId("recetas", this.id).subscribe((resultado: any) => {
          // Preguntar si se ha encontrado un document con ese ID
          if (resultado.payload.data() != null) {
            this.document.id = resultado.payload.id
            this.document.data = resultado.payload.data();
            // Como ejemplo, mostrar el título de la receta en consola
            console.groupCollapsed(this.document.data.titulo);
          } else {
            // No se ha encontrado un document con ese id. Vaciar los datos que hubiera
            this.document.data = {} as Receta
          }

        });
      }
    }
  }


  async clickBotonBorrar() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que quieres borrar esta receta?',
      buttons: [{
        text: 'No',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('La receta no será borrada.');
        }
      }, {
        text: 'Sí',
        handler: () => {
          this.firestoreService.borrar('recetas', this.document.id).then(() => {
            console.log('Receta borrada correctamente');
          }, (error) => {
            console.error(error);
          }
          );
        }
      }]
    });

    await alert.present();
  }

  clickBotonModificar() {
    this.firestoreService.modificar('recetas', this.document.id, this.document.data).then(() => {
      console.log('Receta modificada correctamente');
    }, (error) => {
      console.error(error);
    }
    );

  }

  clickBotonInsertar() {

    this.document.id = '';
    this.creandoNuevaReceta = true;

    this.firestoreService.insertar('recetas', this.document.data).then(() => {
      console.log('Receta creada correctamente');
      this.document.data = {} as Receta;
    }, (error) => {
      console.error(error);
    });
  }

  imagenSelect: string = "";

  async seleccionarImagen() {
    // Comprobar si la aplicación tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        // Si no tiene permiso de lectura se solicita al usuario
        if (result == false) {
          this.imagePicker.requestReadPermission();
        } else {
          // Abrir selector de imágenes (Imagepicker)
          this.imagePicker.getPictures({
            // Permitir solo hasta una imagen
            maximumImagesCount: 1,
            // 1 = Base64
            outputType: 1
          }).then(
            // En la variable results se tienen la imágenes seleccionadas
            (results) => {
              // Si el usuario ha elegido alguna imagen
              if (results.length > 0) {
                // En la variable "imagenSelect" queda almacenada la imagen seleccionada
                this.imagenSelect = "data:image/jpeg;base64," + results[0];
                console.log("Imagen seleccionada (en Base64): " + this.imagenSelect);
              }
            },
            (err) => {
              console.log(err)
            }
          );
        }
      }, (err) => {
        console.log(err);
      });
  }

  async subirImagen() {
    // Mensaje de espera mientras se sube la imagen
    const loading = await this.loadingController.create({
      message: "Espere por favor"
    });
    // Mensahe de finalización de subida de la imagen
    const toast = await this.toastController.create({
      message: "Imagen subida con éxito",
      duration: 3000
    });
    // Carpeta del storage donde se almacenará la imagen
    let nombreCarpeta = "imagenes";
    // Mostrar el mensaje de espera
    loading.present();
    // Asignar el nombre de la imagen en función de la hora actual
    // para evitar duplicidades de nombre
    let nombreImagen = `${new Date().getTime()}`;
    // Llamar al método que sube la imagen al Storage
    this.firestoreService.subirImagen64(nombreCarpeta, nombreImagen, this.imagenSelect).then(snapshot => {
      snapshot.ref.getDownloadURL().then(downloadURL => {
        // En la variable "downloadURL" se obtiene la dirección de la URL de la imagen
        console.log("downloadURL: " + downloadURL);
        this.document.data.downloadURL = downloadURL;
        // Mostrar el mensaje de finalización de la subida
        toast.present();
        // Ocultar mensaje de espera
        loading.dismiss();
      })
    })
  }

  async eliminarArchivo(fileURL: string) {
    const toast = await this.toastController.create({
      message: "Fichero eliminado",
      duration: 3000
    });
    this.firestoreService.eliminarArchivoURL(fileURL).then(() => {
      toast.present();
    }, (err) => {
      console.log(err);
    });
  }

}
