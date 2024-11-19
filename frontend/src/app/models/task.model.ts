export interface Task {
    id?: number;
    creation_date: string;
    entity_name: string;
    task_type: string;
    task_time: string;
    contact_person: string;
    note?: string;
    status: 'open' | 'closed';
  }
  