import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { XmlViewerComponent } from './components/xml-viewer/xml-viewer.component';
import { CfdiVisualizerComponent } from './components/cfdi-visualizer/cfdi-visualizer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    RouterOutlet, 
    XmlViewerComponent,
    CfdiVisualizerComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'frontend';
  cfdiData: any;

  handleProcessComplete(data: any) {
    this.cfdiData = data;
  }
}
