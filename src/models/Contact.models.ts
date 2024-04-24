import pool from "../database";
import { Contact } from "../types";

export async function fetch_contact_by_email(
  email: string
): Promise<Contact | null> {
  const query = "SELECT * FROM contact WHERE email = $1";
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function fetch_contacts_by_phone_number(
  phoneNumber: string
): Promise<Contact[]> {
  const query = "SELECT * FROM contact WHERE phone_number = $1";
  const values = [phoneNumber];
  const result = await pool.query(query, values);
  return result.rows;
}

export async function create_contact(
  email: string,
  phoneNumber: string,
  linkPrecedence: "primary" | "secondary",
  linkedId: number | null
): Promise<Contact> {
  const query =
    "INSERT INTO contact (phone_number, email, linked_id, link_precedence) VALUES ($1, $2, $3, $4) RETURNING *";
  const values = [phoneNumber, email, linkedId, linkPrecedence];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function update_contact_link_precedence(
  contactId: number,
  linkPrecedence: "primary" | "secondary"
): Promise<void> {
  const query = "UPDATE contact SET link_precedence = $1 WHERE id = $2";
  const values = [linkPrecedence, contactId];
  await pool.query(query, values);
}
