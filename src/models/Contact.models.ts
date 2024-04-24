import pool from "../database";
import { ConsolidatedContactInfo, Contact } from "../types";


export const fetch_contact_by_email = async (email: string): Promise<Contact | null> => {
    const query = 'SELECT * FROM contact WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  };
  
  export const fetch_contacts_by_phone_number = async (phone_number: string): Promise<Contact[]> => {
    const query = 'SELECT * FROM contact WHERE phone_number = $1';
    const result = await pool.query(query, [phone_number]);
    return result.rows;
  };
  
  export const create_contact = async (email: string, phone_number: string, link_precedence: 'primary' | 'secondary', linked_id: number | null): Promise<Contact> => {
    const query = 'INSERT INTO contact (email, phone_number, linked_id, link_precedence) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [email, phone_number, linked_id, link_precedence];
    const result = await pool.query(query, values);
    return result.rows[0];
  };
  
  export const update_contact_link_precedence = async (contact_id: number, link_precedence: 'primary' | 'secondary'): Promise<void> => {
    const query = 'UPDATE contact SET link_precedence = $1 WHERE id = $2';
    await pool.query(query, [link_precedence, contact_id]);
  };
  
  export const consolidate_contacts = (contacts: Contact[], email: string | null, phone_number: string | null): ConsolidatedContactInfo => {
    const sorted_contacts = contacts.sort((a, b) => {
      if (a.link_precedence === 'primary') return -1;
      if (b.link_precedence === 'primary') return 1;
      return 0;
    });
    
    const primary_contact = sorted_contacts.find(contact => contact.link_precedence === 'primary')!;
    const secondary_contact_ids = sorted_contacts.filter(contact => contact.link_precedence === 'secondary').map(contact => contact.id);
    
    const emails = [...new Set(sorted_contacts.map(contact => contact.email))];
    const phone_numbers = [...new Set(sorted_contacts.map(contact => contact.phone_number))];
    
    if (email && !emails.includes(email)) {
      emails.push(email);
    }
    if (phone_number && !phone_numbers.includes(phone_number)) {
      phone_numbers.push(phone_number);
    }
    
    return {
      primary_contact_id: primary_contact.id,
      emails,
      phone_numbers,
      secondary_contact_ids
    };
  };
