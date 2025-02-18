import { loadRemoteModule } from '@angular-architects/module-federation';
import {
  AfterContentInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export interface RemoteConf {
  type: 'module' | 'script';
  importName: string;
  remoteEntry: string;
  exposedModule: string;
  elementName: string;
}

@Component({
  template: '<div #vc></div>',
})
export class WrapperComponent implements AfterContentInit {
  @ViewChild('vc', { read: ElementRef, static: true })
  vc: ElementRef;

  constructor(private route: ActivatedRoute) {}
  async ngAfterContentInit(): Promise<void> {
    const elementName = this.route.snapshot.data['elementName'];
    const importName = this.route.snapshot.data['importName'];

    const response = await fetch('http://localhost:8080/configs');
    const data = await response.json();
    console.log(data);

    const registry = data?.configs.reduce((acc, reg) => {
      acc[reg.importName] = () =>
        loadRemoteModule({
          type: reg.type,
          remoteEntry: reg.remoteEntry,
          remoteName: reg.importName,
          exposedModule: reg.exposedModule,
        });
      return acc;
    }, {} as Record<string, () => Promise<any>>);

    console.log('testS', data?.configs);
    console.log('registry:: ', registry);
    const importFn = registry[importName];
    importFn()
      .then((_) => console.debug(`element ${elementName} loaded!`))
      .catch((err) => console.error(`error loading ${elementName}:`, err));

    const element = document.createElement(elementName);
    this.vc.nativeElement.appendChild(element);
  }
}
