import { Request, Response } from 'express';
import { fetch_contact_by_email, fetch_contacts_by_phone_number, create_contact, update_contact_link_precedence, consolidate_contacts } from '../models/Contact.models';
import { ConsolidatedContactInfo } from '../types';


export const identify = async (req: Request, res: Response) => {
    try {
      const { email, phone_number } = req.body;
      
      if (email && phone_number) {
        const existing_email_contact = await fetch_contact_by_email(email);
        const existing_phone_contact = await fetch_contacts_by_phone_number(phone_number);
        
        if (!existing_email_contact && !existing_phone_contact.length) {
          const new_contact = await create_contact(email, phone_number, 'primary', null);
          
          const response: ConsolidatedContactInfo = {
            primary_contact_id: new_contact.id,
            emails: [email],
            phone_numbers: [phone_number],
            secondary_contact_ids: []
          };
          
          return res.json({ contact: response });
        } else if (existing_phone_contact.length && !existing_email_contact) {
          const oldest_primary_contact = existing_phone_contact.find(contact => contact.link_precedence === 'primary');
          
          const new_contact = await create_contact(email, phone_number, 'secondary', oldest_primary_contact.id);
          
          const response: ConsolidatedContactInfo = {
            primary_contact_id: oldest_primary_contact.id,
            emails: [email],
            phone_numbers: [phone_number],
            secondary_contact_ids: [new_contact.id]
          };
          
          return res.json({ contact: response });
        } else if (existing_phone_contact.length && existing_email_contact && existing_phone_contact[0].link_precedence === 'primary') {
          await update_contact_link_precedence(existing_phone_contact[0].id, 'secondary');
          
          const response: ConsolidatedContactInfo = {
            primary_contact_id: existing_email_contact.id,
            emails: [email],
            phone_numbers: [phone_number],
            secondary_contact_ids: []
          };
          
          return res.json({ contact: response });
        }
      } else if (email && !phone_number) {
        const existing_email_contact = await fetch_contact_by_email(email);
        
        if (existing_email_contact) {
          const existing_phone_contacts = await fetch_contacts_by_phone_number(existing_email_contact.phone_number);
          const response = consolidate_contacts(existing_phone_contacts, email, existing_email_contact.phone_number);
          
          return res.json({ contact: response });
        }
      } else if (!email && phone_number) {
        const existing_phone_contacts = await fetch_contacts_by_phone_number(phone_number);
        
        if (existing_phone_contacts.length > 0) {
          const primary_contact = existing_phone_contacts.find(contact => contact.link_precedence === 'primary');
          const response = consolidate_contacts(existing_phone_contacts, primary_contact.email, phone_number);
          
          return res.json({ contact: response });
        }
      }
      
      res.status(400).json({ message: 'Invalid request payload' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };