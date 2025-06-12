import { Component } from '@angular/core';

import {
  DxTabPanelModule, DxCheckBoxModule, DxSelectBoxModule, DxTemplateModule,
} from 'devextreme-angular';
import { DxTabPanelTypes } from 'devextreme-angular/ui/tab-panel';

import { CommonModule } from '@angular/common';
import { Service, TabPanelItem } from './app.service';


@Component({
  selector: 'app-navbarexmpl',
  imports: [CommonModule,
    DxTabPanelModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxTemplateModule,],
    providers: [Service],
  templateUrl: './navbarexmpl.component.html',
  styleUrl: './navbarexmpl.component.css'
})
export class NavbarexmplComponent {
  dataSource: TabPanelItem[];

  tabsPositions: DxTabPanelTypes.Position[] = [
    'left', 'top', 'right', 'bottom',
  ];

  tabsPosition: DxTabPanelTypes.Position = this.tabsPositions[0];

  stylingModes: DxTabPanelTypes.TabsStyle[] = ['secondary', 'primary'];

  stylingMode: DxTabPanelTypes.TabsStyle = this.stylingModes[0];

  iconPositions: DxTabPanelTypes.TabsIconPosition[] = [
    'top', 'start', 'end', 'bottom',
  ];

  iconPosition: DxTabPanelTypes.TabsIconPosition = this.iconPositions[0];

  constructor(service: Service) {
    this.dataSource = service.getItems();
  }

  getTaskItemClasses(priority: string) {
    return `task-item task-item-priority-${priority}`;
  }

}
