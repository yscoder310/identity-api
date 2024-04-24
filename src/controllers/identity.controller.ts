import { Request, Response } from "express";
import {
  fetch_contact_by_email,
  fetch_contacts_by_phone_number,
  create_contact,
  update_contact_link_precedence,
} from "../models/Contact.models";
import { consolidate_contacts } from "../helpers";

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phone_number } = req.body;

    const existingEmailContact = email
      ? await fetch_contact_by_email(email)
      : null;
    const existingPhoneContact = phone_number
      ? await fetch_contacts_by_phone_number(phone_number)
      : null;

    if (!email && !phone_number) {
      return res.status(400).json({ message: "Invalid request payload" });
    }

    if (!email || !phone_number) {
      const existingContacts = existingPhoneContact.filter(contact => contact.link_precedence === 'secondary');
      const response = consolidate_contacts(existingContacts, email, phone_number);
      return res.json({ contact: response });
    }

    if (!existingEmailContact && !existingPhoneContact.length) {
      const newContact = await create_contact(
        email!,
        phone_number!,
        "primary",
        null
      );
      const response = consolidate_contacts([newContact], email, phone_number);
      return res.json({ contact: response });
    }

    if (existingPhoneContact && !existingEmailContact) {
      const oldestPrimaryContact = existingPhoneContact.find(
        (contact) => contact.link_precedence === "primary"
      )!;
      const newContact = await create_contact(
        email!,
        phone_number!,
        "secondary",
        oldestPrimaryContact.id
      );
      const response = consolidate_contacts(
        [...existingPhoneContact, newContact],
        email,
        phone_number
      );
      return res.json({ contact: response });
    }

    if (
      existingPhoneContact &&
      existingEmailContact &&
      existingPhoneContact[0].link_precedence === "primary"
    ) {
      await update_contact_link_precedence(
        existingPhoneContact[0].id,
        "secondary"
      );
      const response = consolidate_contacts(
        existingPhoneContact,
        email,
        phone_number
      );
      return res.json({ contact: response });
    }

    return res.status(400).json({ message: "Invalid request payload" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
