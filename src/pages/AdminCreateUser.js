import React, { useState } from 'react';
import api from '../utils/api';
import { Button, Input, Select, Stack, Box, FormLabel } from '@chakra-ui/react';

export default function AdminCreateUser({ onSuccess }) {
  // Notify other parts of the app that a modal (create user) is open so
  // floating toolbars can hide when account creation overlays the UI.
  React.useEffect(() => {
    try { window.dispatchEvent(new CustomEvent('app:modal-open')); } catch (e) {}
    return () => { try { window.dispatchEvent(new CustomEvent('app:modal-close')); } catch (e) {} };
  }, []);
  const [role, setRole] = useState('Student');
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '', department: '', student_no: '', course: '', yr_section: '', position: '', contact_number: '', plate_number: '' });
  const [orFile, setOrFile] = useState(null);
  const [crFile, setCrFile] = useState(null);
  const [message, setMessage] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      // Ensure CSRF cookie is initialized for Sanctum-protected endpoints
      await api.initCsrf();
      const data = new FormData();
      data.append('firstname', form.firstname);
      data.append('lastname', form.lastname);
      data.append('email', form.email);
      data.append('password', form.password);
      data.append('department', form.department);
      data.append('contact_number', form.contact_number);
      data.append('plate_number', form.plate_number);
      if (role === 'Student') {
        data.append('student_no', form.student_no);
        data.append('course', form.course);
        data.append('yr_section', form.yr_section);
        data.append('faculty_id', form.faculty_id || '');
        data.append('employee_id', form.employee_id || '');
      } else {
        data.append('position', form.position);
        data.append('faculty_id', form.faculty_id || '');
        data.append('employee_id', form.employee_id || '');
      }
  // Prefer separate files but keep backward compatible single field
    if (orFile) data.append('or_file', orFile);
    if (crFile) data.append('cr_file', crFile);

    // Backend routes use kebab-case: create-student, create-faculty, create-employee, create-guard
    const endpoint = `/admin/create-${String(role).toLowerCase()}`;
        // Debug: show which endpoint we're posting to
        console.debug('AdminCreateUser: posting to', endpoint);
        const res = await api.post(endpoint, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Created: ' + JSON.stringify(res.data));
  if (onSuccess) onSuccess(res.data);
    } catch (err) {
        // Try to extract validation details from the response (backend sends data => validation errors)
        const resp = err.response?.data;
        let msg = 'Error: ' + (resp?.message || err.message || 'Unknown error');
        if (resp?.data) {
          // If it's a validator messages bag, render fields -> messages
          if (typeof resp.data === 'object') {
            const parts = [];
            for (const [field, val] of Object.entries(resp.data)) {
              if (Array.isArray(val)) parts.push(`${field}: ${val.join(', ')}`);
              else parts.push(`${field}: ${String(val)}`);
            }
            if (parts.length) msg += '\n' + parts.join('\n');
          } else {
            msg += '\n' + JSON.stringify(resp.data);
          }
        }
        console.error('AdminCreateUser error response:', err.response || err);
        setMessage(msg);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Create {role}</h2>

      <Box mb={4}>
        <FormLabel>Role</FormLabel>
        <Select value={role} onChange={(e) => setRole(e.target.value)} maxW="320px">
          <option>Student</option>
          <option>Faculty</option>
          <option>Employee</option>
          <option>Guard</option>
        </Select>
      </Box>

      <form onSubmit={submit}>
        <Stack spacing={3} maxW="720px">
          <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
            <Input name="firstname" placeholder="First name" value={form.firstname} onChange={onChange} isRequired />
            <Input name="lastname" placeholder="Last name" value={form.lastname} onChange={onChange} isRequired />
          </Stack>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
            <Input name="email" placeholder="Email" value={form.email} onChange={onChange} isRequired />
            <Input name="password" placeholder="Password" value={form.password} onChange={onChange} isRequired />
          </Stack>

          {role !== 'Guard' && (
            <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
              <Input name="department" placeholder="Department" value={form.department} onChange={onChange} />
              <Input name="contact_number" placeholder="Contact number" value={form.contact_number} onChange={onChange} />
            </Stack>
          )}

          {role === 'Student' && (
            <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
              <Input name="student_no" placeholder="Student No" value={form.student_no} onChange={onChange} />
              <Input name="course" placeholder="Course" value={form.course} onChange={onChange} />
              <Input name="yr_section" placeholder="Yr & Section" value={form.yr_section} onChange={onChange} />
            </Stack>
          )}

          {(role === 'Faculty' || role === 'Employee') && (
            <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
              <Input name="position" placeholder="Position" value={form.position} onChange={onChange} />
              <Input name="employee_id" placeholder="Employee ID" value={form.employee_id || ''} onChange={onChange} />
            </Stack>
          )}

          {role === 'Guard' && (
            <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
              <Input name="username" placeholder="Username" value={form.username || ''} onChange={onChange} />
              <Input name="position" placeholder="Position" value={form.position} onChange={onChange} />
            </Stack>
          )}

          {role !== 'Guard' && (
            <Input name="plate_number" placeholder="Plate number (optional)" value={form.plate_number} onChange={onChange} />
          )}

          {(role === 'Student' || role === 'Faculty' || role === 'Employee') && (
            <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align="center">
              <Box>
                <FormLabel fontSize="sm">Official Receipt (OR) PDF</FormLabel>
                <Input type="file" accept="application/pdf" onChange={(e) => setOrFile(e.target.files[0])} />
              </Box>
              <Box>
                <FormLabel fontSize="sm">Certificate of Registration (CR) PDF</FormLabel>
                <Input type="file" accept="application/pdf" onChange={(e) => setCrFile(e.target.files[0])} />
              </Box>
            </Stack>
          )}

          <Stack direction="row" justify="flex-end" spacing={3}>
            <Button variant="outline" onClick={() => { if (onSuccess) onSuccess(null); }}>Cancel</Button>
            <Button colorScheme="red" type="submit">Create {role}</Button>
          </Stack>

          {message && <Box mt={2}>{message}</Box>}
        </Stack>
      </form>
    </div>
  );
}
