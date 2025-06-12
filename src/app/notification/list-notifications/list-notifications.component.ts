import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../service/notification.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-list-notifications',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule,
    BadgeModule,
    RippleModule,
    TooltipModule,
    AvatarModule,
    AnimateOnScrollModule,
    DividerModule,
    TagModule
  ],
  templateUrl: './list-notifications.component.html',
  styleUrls: ['./list-notifications.component.css']
})
export class ListNotificationsComponent implements OnInit {
  notifications: any[] = [];
  userId: number | null = null;
  unreadCount: number = 0;
  loading: boolean = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId'));
    if (this.userId) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
  this.loading = true;
  this.notificationService.getNotifications(this.userId!).subscribe({
    next: (data) => {
      // Tri des notifications par date décroissante
      this.notifications = data.sort((a, b) => {
        return new Date(b.dateNotification).getTime() - new Date(a.dateNotification).getTime();
      });
      this.unreadCount = data.filter((n: any) => !n.lue).length;
      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });
}

  markAsRead(notificationId: number) {
    this.notificationService.markOneAsRead(notificationId).subscribe(() => {
      const notif = this.notifications.find(n => n.id === notificationId);
      if (notif && !notif.lue) {
        notif.lue = true;
        this.unreadCount--;
      }
    });
  }

  markAllAsRead() {
    if (this.userId && this.unreadCount > 0) {
      this.notificationService.markAsRead(this.userId).subscribe(() => {
        this.notifications.forEach(n => {
          if (!n.lue) {
            n.lue = true;
          }
        });
        this.unreadCount = 0;
      });
    }
  }

  getNotificationIcon(type: string): string {
    // Vous pouvez personnaliser cela en fonction des types de notifications
    switch(type) {
      case 'alert': return 'pi pi-exclamation-triangle';
      case 'message': return 'pi pi-envelope';
      case 'update': return 'pi pi-bell';
      case 'success': return 'pi pi-check-circle';
      default: return 'pi pi-info-circle';
    }
  }
}