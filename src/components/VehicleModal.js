import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Box, Input, Stack, Button, Select, FormLabel, Heading, Text } from '@chakra-ui/react';

export default function VehicleModal({ user, vehicle, onClose, onSuccess }) {
  const [form, setForm] = useState({ plate_number: user?.plate_number || '', vehicle_color: '', vehicle_type: 'car', brand: '', model: '' });
  const [orFile, setOrFile] = useState(null);
  const [crFile, setCrFile] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // populate form when editing an existing vehicle
  useEffect(() => {
    if (vehicle) {
      setForm({
        plate_number: vehicle.plate_number || user?.plate_number || '',
        vehicle_color: vehicle.vehicle_color || '',
        vehicle_type: vehicle.vehicle_type || 'car',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
      });
    } else {
      setForm({ plate_number: user?.plate_number || '', vehicle_color: '', vehicle_type: 'car', brand: '', model: '' });
    }
    setOrFile(null);
    setCrFile(null);
    setMessage('');
  }, [vehicle, user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    if (!vehicle) data.append('user_id', user.id);
    data.append('plate_number', form.plate_number);
    data.append('vehicle_color', form.vehicle_color);
    data.append('vehicle_type', form.vehicle_type);
    data.append('brand', form.brand);
    data.append('model', form.model);
    if (orFile) data.append('or_file', orFile);
    if (crFile) data.append('cr_file', crFile);

    try {
      if (vehicle) {
        data.append('_method', 'PUT');
        await api.post(`/vehicles/${vehicle.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Updated vehicle');
      } else {
        await api.post('/vehicles', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Created vehicle');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message));
    } finally { setSaving(false); }
  };

  const destroy = async () => {
    if (!vehicle) return;
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${vehicle.id}`);
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage('Delete error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Box p={4} maxW={{ base: '90vw', md: '560px' }}>
      <Heading size="sm" mb={3}>{vehicle ? `Edit vehicle for ${user?.name}` : `Add vehicle for ${user?.name}`}</Heading>
      <form onSubmit={submit}>
        <Stack spacing={3}>
          <Input name="plate_number" placeholder="Plate number" value={form.plate_number} onChange={onChange} required />
          <Input name="vehicle_color" placeholder="Color" value={form.vehicle_color} onChange={onChange} />

          <Box>
            <FormLabel>Vehicle Type</FormLabel>
            <Select name="vehicle_type" value={form.vehicle_type} onChange={onChange}>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="bicycle">Bicycle</option>
            </Select>
          </Box>

          <Input name="brand" placeholder="Brand" value={form.brand} onChange={onChange} />
          <Input name="model" placeholder="Model" value={form.model} onChange={onChange} />

          <Box>
            <FormLabel>Vehicle OR (PDF)</FormLabel>
            <Input type="file" accept="application/pdf" onChange={(e) => setOrFile(e.target.files[0])} />
          </Box>
          <Box>
            <FormLabel>Vehicle CR (PDF)</FormLabel>
            <Input type="file" accept="application/pdf" onChange={(e) => setCrFile(e.target.files[0])} />
          </Box>

          <Stack direction="row" justify="flex-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" type="submit" isLoading={saving}>{vehicle ? 'Save' : 'Add'}</Button>
            {vehicle && <Button colorScheme="red" variant="ghost" onClick={destroy}>Delete</Button>}
          </Stack>

          {message && <Text color="red.600">{message}</Text>}
        </Stack>
      </form>
    </Box>
  );
}
