// client/src/components/support/AddTicketModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as supportService from '../../services/supportService';
import { useTranslation } from 'react-i18next';

// --- STYLED COMPONENTS ---
const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1010;
`;
const ModalContent = styled.div`
  background: #1e1e2d;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  color: ${({ theme }) => theme.colors.text};
`;
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  label { display: block; margin-bottom: 0.5rem; }
`;
const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  min-height: 120px;
  resize: vertical;
`;
const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, primary }) => (primary ? theme.colors.primary : '#333')};
  color: ${({ primary }) => (primary ? '#000' : 'white')};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;

const AddTicketModal = ({ onClose, onTicketCreated }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: '', subject: '', description: '', priority: 'Medium'
  });
  const [files, setFiles] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // NOTE: This uses the public Knowledge Base categories.
        // You should create a separate API for support ticket categories if needed.
        const res = await supportService.getCategories(); 
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({...prev, category: res.data[0]._id}));
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files) {
      for (let i = 0; i < files.length; i++) {
        data.append('attachments', files[i]);
      }
    }

    try {
      await supportService.createTicket(data);
      onTicketCreated(); // Refreshes the list on the main page
      onClose(); // Closes the modal
    } catch (error) {
      alert(error.response?.data?.msg || 'Failed to create ticket.');
    }
  };

  const priorityOptions = [
    { value: 'Critical', label: 'Critical', color: '#d9534f' },
    { value: 'High', label: 'High', color: '#f0ad4e' },
    { value: 'Medium', label: 'Medium', color: '#5bc0de' },
    { value: 'Low', label: 'Low', color: '#5cb85c' },
  ];

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h2>Create New Support Ticket</h2>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="category">Category</label>
            <Select id="category" name="category" value={formData.category} onChange={handleChange}>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup>
            <label htmlFor="subject">Subject</label>
            <Input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <label htmlFor="description">Describe the issue</label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <label htmlFor="attachments">Attachments</label>
            <Input 
              id="attachments" 
              name="attachments" 
              type="file" 
              multiple
              onChange={handleFileChange}
              accept="image/*, .pdf, .doc, .docx, .txt"
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="priority">Priority</label>
            <Select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
              {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </FormGroup>
          <ButtonGroup>
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" primary>Save Ticket</Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AddTicketModal;