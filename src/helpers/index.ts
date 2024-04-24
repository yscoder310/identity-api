import { Contact, ConsolidatedContactInfo } from '../types';

export const consolidate_contacts = (contacts: Contact[], email: string | null, phone_number: string | null): ConsolidatedContactInfo => {
    const filteredContacts = contacts.filter(contact => contact.link_precedence === 'secondary');
    
    if (email === null || phone_number === null) {
        const emails = [...new Set(filteredContacts.map(contact => contact.email))];
        const phone_numbers = [...new Set(filteredContacts.map(contact => contact.phone_number))];
        const primary_contact = filteredContacts.find(contact => contact.link_precedence === 'primary');
        const secondary_contact_ids = filteredContacts.map(contact => contact.id);
        
        return {
            primary_contact_id: primary_contact ? primary_contact.id : 0,
            emails,
            phone_numbers: phone_numbers,
            secondary_contact_ids: secondary_contact_ids
        };
    }
   
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