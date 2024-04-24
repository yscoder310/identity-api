export interface Contact {
  id: number;
  email: string;
  phone_number: string;
  linked_id: number | null;
  link_precedence: "primary" | "secondary";
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ConsolidatedContactInfo {
  primary_contact_id: number;
  emails: string[];
  phone_numbers: string[];
  secondary_contact_ids: number[];
}
