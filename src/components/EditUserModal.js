import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Stack, Heading, Link } from '@chakra-ui/react';
import api from '../utils/api';
import Modal from 'components/Modal';
import VehicleListModal from './VehicleListModal';

export default function EditUserModal({ user, onClose, onSaved }) {
  // Notify the app when this modal is mounted/unmounted so floating toolbars
  // (like the parking layout editor) can hide while the modal is visible.
  useEffect(() => {
    try { window.dispatchEvent(new CustomEvent('app:modal-open')); } catch (e) {}
    return () => { try { window.dispatchEvent(new CustomEvent('app:modal-close')); } catch (e) {} };
  }, []);
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', department: '', contact_number: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    // split name into firstname/lastname
    const parts = (user.name || '').split(' ');
    const firstname = parts.shift() || '';
    const lastname = parts.join(' ') || '';
    setForm({ firstname, lastname, email: user.email || '', department: user.department || '', contact_number: user.contact_number || '' });
    setMessage('');
    // load vehicles for display (OR/CR links)
    (async () => {
      try {
        const res = await api.get('/vehicles', { params: { user_id: user.id } });
        const list = res.data?.data || res.data || [];
        const arr = Array.isArray(list) ? list : Object.values(list || {});
        // Ensure we only show vehicles belonging to the selected user
        setVehicles(arr.filter(v => Number(v.user_id) === Number(user.id)));
      } catch (err) {
        console.debug('Failed to load vehicles for EditUserModal', err);
      }
    })();
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
          {/* Show current OR/CR files (read-only links) and quick vehicle management */}
          <Box mt={4}>
            <Heading size="sm" mb={2}>Vehicle Documents</Heading>
            {vehicles.length === 0 ? (
              <Box fontSize="sm" color="gray.500">No vehicles found for this user.</Box>
            ) : (
              vehicles.map(v => (
                <Box key={v.id} mb={2}>
                  <Box fontSize="sm"><strong>{v.plate_number || 'Vehicle #' + v.id}</strong> &nbsp; {v.vehicle_type || ''} {v.vehicle_color ? `(${v.vehicle_color})` : ''}</Box>
                  <Box mt={1} display="flex" gap={2}>
                    {v.or_number ? <Box fontSize="sm">OR: {v.or_number}</Box> : <Box fontSize="sm" color="gray.500">OR: —</Box>}
                    {v.or_path ? <Link href={`http://localhost:8000/api/image/${v.or_path}`} isExternal>View OR</Link> : null}
                    {v.cr_number ? <Box fontSize="sm">CR: {v.cr_number}</Box> : <Box fontSize="sm" color="gray.500">CR: —</Box>}
                    {v.cr_path ? <Link href={`http://localhost:8000/api/image/${v.cr_path}`} isExternal>View CR</Link> : null}
                  </Box>
                </Box>
              ))
            )}
            <Box mt={3}>
              <Button size="sm" variant="outline" onClick={() => setShowVehiclesModal(true)}>Manage Vehicles</Button>
            </Box>
          </Box>
        </Stack>
      </form>

      <Modal isOpen={showVehiclesModal} onClose={() => setShowVehiclesModal(false)} title={`Vehicles for ${user?.name}`} maxWidth={{ base: '95vw', md: '760px' }}>
        {showVehiclesModal && (
          <VehicleListModal user={user} onClose={() => setShowVehiclesModal(false)} onUpdated={() => { setShowVehiclesModal(false); /* refresh vehicles */ (async () => { try { const res = await api.get('/vehicles', { params: { user_id: user.id } }); const list = res.data?.data || res.data || []; setVehicles(Array.isArray(list) ? list : Object.values(list || {})); } catch (err) { console.debug(err); } })(); }} />
        )}
      </Modal>
    </Box>
  );
}
