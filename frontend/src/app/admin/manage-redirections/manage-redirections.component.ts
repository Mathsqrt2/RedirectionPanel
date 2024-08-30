import { Component, OnInit } from '@angular/core';
import { RedirectionsService } from '../../services/redirections.service';

@Component({
  selector: 'app-manage-redirections',
  templateUrl: './manage-redirections.component.html',
  styleUrl: './manage-redirections.component.scss'
})

export class ManageRedirectionsComponent implements OnInit {

  redirections: any[] = [1,2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
  
  constructor(
    private redirectionsService: RedirectionsService,
  ){}

  ngOnInit(): void {
    this.redirections = this.redirectionsService.getRedirections();
  }


}
