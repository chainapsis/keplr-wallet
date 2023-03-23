// Params Type Definitions

export interface NotyphiOrganisations {
  [key: string]: NotyphiOrganisation;
}
export interface NotyphiOrganisation {
  id: string;
  name: string;
  logo_href: string;
  follow: boolean;
}

export interface NotyphiTopic {
  name: string;
}

export interface NotyphiNotifications {
  [key: string]: NotyphiNotification;
}

export interface NotyphiNotification {
  delivery_id: string;
  title: string;
  content: string;
  cta_title: string;
  cta_url: string;
  delivered_at: Date;
  read_at: Date;
  clicked_at: Date;
  rejected_at: Date;
  organisation_name: string;
  image_url: string;
}

export interface NotificationSetup {
  unreadNotification: boolean;
  isNotificationOn: boolean;
  organisations: NotyphiOrganisations;
  allNotifications: NotyphiNotification[];
}
