import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Box, Input, Stack, Button, Select, FormLabel, Heading, Text, Alert, AlertIcon, useToast } from '@chakra-ui/react';

export default function VehicleModal({ user, vehicle, onClose, onSuccess }) {
  const [form, setForm] = useState({ plate_number: user?.plate_number || '', vehicle_color: '', vehicle_type: 'car', brand: '', model: '' });
  const [orFile, setOrFile] = useState(null);
  const [crFile, setCrFile] = useState(null);
  const [replaceDocs, setReplaceDocs] = useState(false);
  const [orNumber, setOrNumber] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [orNumberError, setOrNumberError] = useState('');
  const [crNumberError, setCrNumberError] = useState('');
  const [plateError, setPlateError] = useState('');
  const [checkingUnique, setCheckingUnique] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState(null);
  const toast = useToast();

  // show validation errors as a popup toast when they arrive
  useEffect(() => {
    if (!validationErrors) return;
    try {
      const entries = Object.entries(validationErrors || {});
      const message = entries.map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
      toast({
        title: 'Validation error',
        description: message || 'Please check the form and try again.',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (e) {
      console.warn('Error showing validation toast', e);
    }
  }, [validationErrors, toast]);

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
      setOrNumber(vehicle?.or_number || '');
      setCrNumber(vehicle?.cr_number || '');
    } else {
      setForm({ plate_number: user?.plate_number || '', vehicle_color: '', vehicle_type: 'car', brand: '', model: '' });
      setOrNumber('');
      setCrNumber('');
    }
    setOrFile(null);
    setCrFile(null);
    setMessage('');
    setReplaceDocs(false);
  }, [vehicle, user]);

  const onChange = (e) => { setValidationErrors(null); setForm({ ...form, [e.target.name]: e.target.value }); };

  const submit = async (e) => {
    e.preventDefault();
    setValidationErrors(null);
    setSaving(true);
    // pre-submit uniqueness check for OR/CR numbers and plate if provided
    try {
      const orVal = orNumber?.trim() || null;
      const crVal = crNumber?.trim() || null;
      const plateVal = (form.plate_number || '').trim() || null;
      let payload = { exclude_vehicle_id: vehicle?.id || null };
      if (orVal) payload.or_number = orVal;
      if (crVal) payload.cr_number = crVal;
      if (plateVal) payload.plate_number = plateVal;

      if (Object.keys(payload).length > 1) {
        setCheckingUnique(true);
        await api.initCsrf();
        const resp = await api.post('vehicles/check-unique', payload);
        setCheckingUnique(false);
        const exists = resp.data?.exists || {};
        if (exists.or_number) { setOrNumberError('OR number already in use'); setSaving(false); return; }
        if (exists.cr_number) { setCrNumberError('CR number already in use'); setSaving(false); return; }
        if (exists.plate_number) { setPlateError('Plate number already in use'); setSaving(false); return; }
      }
    } catch (e) {
      setCheckingUnique(false);
      console.warn('Could not validate OR/CR/Plate uniqueness', e);
      // allow backend to validate but inform user
    }
    const data = new FormData();
    if (!vehicle) data.append('user_id', user.id);
    data.append('plate_number', form.plate_number);
    data.append('vehicle_color', form.vehicle_color);
    data.append('vehicle_type', form.vehicle_type);
    data.append('brand', form.brand);
    data.append('model', form.model);
    if (orNumber) data.append('or_number', orNumber);
    if (crNumber) data.append('cr_number', crNumber);
    if (orFile) data.append('or_file', orFile);
    if (crFile) data.append('cr_file', crFile);

    try {
      if (vehicle) {
        data.append('_method', 'PUT');
        await api.post(`vehicles/${vehicle.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Updated vehicle');
        setValidationErrors(null);
        try { toast({ title: 'Saved', description: 'Vehicle updated', status: 'success', duration: 3000, isClosable: true, position: 'top-right' }); } catch (e) {}
      } else {
        await api.post('vehicles', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Created vehicle');
        setValidationErrors(null);
        try { toast({ title: 'Created', description: 'Vehicle created', status: 'success', duration: 3000, isClosable: true, position: 'top-right' }); } catch (e) {}
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      // If backend returned validation errors (422) show them nicely
      const status = err.response?.status;
      const payload = err.response?.data;
      if (status === 422 && payload) {
        const errors = payload.data || payload.errors || {};
        // normalize to object of messages
        const joined = Object.entries(errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
        setValidationErrors(errors);
        setMessage('Validation error');
      } else {
        setMessage('Error: ' + (err.response?.data?.message || err.message));
      }
    } finally { setSaving(false); }
  };

  const destroy = async () => {
    if (!vehicle) return;
    if (!window.confirm('Delete this vehicle?')) return;
    try {
  await api.delete(`vehicles/${vehicle.id}`);
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
          <Input name="plate_number" placeholder="Plate number" value={form.plate_number} onChange={onChange} required onBlur={async () => {
            const v = (form.plate_number || '').trim();
            setPlateError('');
            if (!v) return;
            try {
              setCheckingUnique(true);
              await api.initCsrf();
              const r = await api.post('vehicles/check-unique', { plate_number: v, exclude_vehicle_id: vehicle?.id || null });
              setCheckingUnique(false);
              if (r.data?.exists?.plate_number) setPlateError('Plate number already in use');
              else setPlateError('');
            } catch (e) { setCheckingUnique(false); console.warn(e); }
          }} />
          {plateError && <Alert status="error" mt={2}><AlertIcon />{plateError}</Alert>}
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
            {vehicle && vehicle.or_path && !replaceDocs ? (
              <Box mb={2}>
                <a href={`http://localhost:8000/api/image/${vehicle.or_path}`} target="_blank" rel="noreferrer">View existing OR</a>
                <Button size="sm" ml={3} onClick={() => setReplaceDocs(true)}>Replace</Button>
              </Box>
            ) : (
              <Input type="file" accept="application/pdf" onChange={(e) => setOrFile(e.target.files[0])} />
            )}
          </Box>
          <Box>
            <FormLabel>Vehicle CR (PDF)</FormLabel>
            {vehicle && vehicle.cr_path && !replaceDocs ? (
              <Box mb={2}>
                <a href={`http://localhost:8000/api/image/${vehicle.cr_path}`} target="_blank" rel="noreferrer">View existing CR</a>
                <Button size="sm" ml={3} onClick={() => setReplaceDocs(true)}>Replace</Button>
              </Box>
            ) : (
              <Input type="file" accept="application/pdf" onChange={(e) => setCrFile(e.target.files[0])} />
            )}
          </Box>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
              <div style={{ flex: 1 }}>
              <Input name="or_number" placeholder="OR number" value={orNumber} onChange={(e) => { setOrNumber(e.target.value); setOrNumberError(''); }} onBlur={async () => {
                const v = orNumber?.trim() || null; setOrNumberError(''); if (!v) return; try { setCheckingUnique(true); await api.initCsrf(); const r = await api.post('vehicles/check-unique', { or_number: v, exclude_vehicle_id: vehicle?.id || null }); setCheckingUnique(false); if (r.data?.exists?.or_number) setOrNumberError('OR number already in use'); } catch (e) { setCheckingUnique(false); console.warn(e); }
              }} isInvalid={!!orNumberError} />
              {orNumberError && <Box color="red.500" fontSize="sm" mt={1}>{orNumberError}</Box>}
            </div>
              <div style={{ flex: 1 }}>
              <Input name="cr_number" placeholder="CR number" value={crNumber} onChange={(e) => { setCrNumber(e.target.value); setCrNumberError(''); }} onBlur={async () => {
                const v = crNumber?.trim() || null; setCrNumberError(''); if (!v) return; try { setCheckingUnique(true); await api.initCsrf(); const r = await api.post('vehicles/check-unique', { cr_number: v, exclude_vehicle_id: vehicle?.id || null }); setCheckingUnique(false); if (r.data?.exists?.cr_number) setCrNumberError('CR number already in use'); } catch (e) { setCheckingUnique(false); console.warn(e); }
              }} isInvalid={!!crNumberError} />
              {crNumberError && <Box color="red.500" fontSize="sm" mt={1}>{crNumberError}</Box>}
            </div>
          </Stack>

          <Stack direction="row" justify="flex-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" type="submit" isLoading={saving}>{vehicle ? 'Save' : 'Add'}</Button>
            {vehicle && <Button colorScheme="red" variant="ghost" onClick={destroy}>Delete</Button>}
          </Stack>

          {/* validationErrors are shown as a popup toast via useToast */}
          {message && !validationErrors && <Text color="red.600">{message}</Text>}
        </Stack>
      </form>
    </Box>
  );
}
