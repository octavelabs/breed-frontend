export type CommunityMeetingFormData = {
 title:string;
 community: string;
 guests: string;
 description: string;
 date: string;
 timeZone: string;
 time: string;
 timeFormat: string;
 meetingFrequency: string;
 repeatInterval: number;
 repeatPattern:string;
 repeatDays:string[];
 saveDraftOfRecordings: boolean;
 lateInterval: string
}

export type OpenMeetingFormData = {
 title:string;
 description: string;
 date: string;
 timeZone: string;
 time: string;
 timeFormat: string;
 meetingFrequency: string;
 repeatInterval: number;
 repeatPattern:string;
 repeatDays:string[];
 saveDraftOfRecordings: boolean;
 lateInterval: string;
 guests:string[]
}

 export interface Guest {
    id: string;
    name: string;
    subtitle: string;
    avatar: string;
    invited: boolean;
  }

   export interface RecordingCardDetails {
    id: string;
    title: string;
    thumbnail: string;
    date: string;

     time: string;
  status: string;

  attendees: number;
  duration: string;
  comments: number;
  }