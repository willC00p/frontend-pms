import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Stack, Heading } from '@chakra-ui/react';
import api from '../utils/api';

export default function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', department: '', contact_number: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    // split name into firstname/lastname
    const parts = (user.name || '').split(' ');
    const firstname = parts.shift() || '';
    const lastname = parts.join(' ') || '';
    setForm({ firstname, lastname, email: user.email || '', department: user.department || '', contact_number: user.contact_number || '' });
    setMessage('');
  }, [user]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const payload = {
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        department: form.department,
        contact_number: form.contact_number
      };
      await api.put(`/users/${user.id}`, payload);
      setMessage('Saved');
      if (onSaved) onSaved();
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Box p={4} maxW={{ base: '90vw', md: '720px' }}>
      <Heading size="md" mb={3}>Edit {user.name}</Heading>
      <form onSubmit={submit}>
        <Stack spacing={3}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
            <Input name="firstname" placeholder="First name" value={form.firstname} onChange={onChange} isRequired />
            <Input name="lastname" placeholder="Last name" value={form.lastname} onChange={onChange} isRequired />
          </Stack>
          <Input name="email" placeholder="Email" value={form.email} onChange={onChange} isRequired />
          <Input name="department" placeholder="Department" value={form.department} onChange={onChange} />
          <Input name="contact_number" placeholder="Contact number" value={form.contact_number} onChange={onChange} />

          <Stack direction="row" justify="flex-end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" type="submit" isLoading={loading}>Save</Button>
          </Stack>
          {message && <Box color="red.500">{message}</Box>}
        </Stack>
      </form>
    </Box>
  );
}
