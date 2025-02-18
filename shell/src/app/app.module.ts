import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { startsWith } from './router.utils'; // Hàm matcher
import { RemoteConf, WrapperComponent } from './wrapper/wrapper.component';

const initialRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
];

interface DataInterface {
  configs: RemoteConf[];
}

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(initialRoutes),
  ],
  declarations: [AppComponent, HomeComponent, WrapperComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private router: Router, private http: HttpClient) {
    this.loadDynamicRoutes();
  }

  private loadDynamicRoutes() {
    this.http
      .get<DataInterface>('http://localhost:8080/configs')
      .subscribe((routes: DataInterface) => {
        console.log(routes);
        const dynamicRoutes = routes?.configs?.map((route) => {
          console.log(route);
          return {
            matcher: startsWith(route.importName), // Sử dụng matcher từ route.startWith
            component: WrapperComponent,
            data: {
              importName: route.importName,
              elementName: route.elementName,
            },
          };
        });

        this.router.resetConfig([...this.router.config, ...dynamicRoutes]);
      });
  }
}
