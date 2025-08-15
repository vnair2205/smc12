import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Modal } from '../common/Modal';

// --- Styled Components ---
const FormContainer = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const SectionTitle = styled.h2`
    color: ${({ theme }) => theme.colors.primary};
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
    border: 1px solid #444;
    border-radius: 8px;
    background-color: #33333d;
    color: white;
    font-size: 1rem;
    width: 100%;
    
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

const Button = styled.button`
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    width: fit-content;

    &:hover {
        background-color: #02c3b2;
    }

    &:disabled {
        background-color: #555;
        cursor: not-allowed;
    }
`;

const StatusMessage = styled.p`
    font-size: 1rem;
    color: ${({ type }) => (type === 'success' ? '#4CAF50' : '#F44336')};
`;

const PersonalInfo = ({ user }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        billingAddress: {
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [newEmailOrPhone, setNewEmailOrPhone] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phoneNumber,
                billingAddress: user.billingAddress || {}
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('billingAddress')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                billingAddress: {
                    ...prev.billingAddress,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        const config = { headers: { 'x-auth-token': token } };
        try {
            await axios.post('/api/auth/update-email', { oldEmail: user.email, newEmail: formData.email }, config);
            setNewEmailOrPhone(formData.email);
            setIsEmailModalOpen(true);
            setStatus({ message: 'OTP sent to your new email.', type: 'success' });
        } catch (err) {
            console.error(err);
            setStatus({ message: 'Failed to send OTP. Please try again.', type: 'error' });
        }
    };

    const handlePhoneChange = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        const config = { headers: { 'x-auth-token': token } };
        try {
            await axios.post('/api/auth/update-phone', { email: user.email, newPhoneNumber: formData.phone }, config);
            setNewEmailOrPhone(formData.phone);
            setIsPhoneModalOpen(true);
            setStatus({ message: 'OTP sent to your new phone number.', type: 'success' });
        } catch (err) {
            console.error(err);
            setStatus({ message: 'Failed to send OTP. Please try again.', type: 'error' });
        }
    };

    const handleOtpVerification = async (isEmail) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const endpoint = isEmail ? '/api/auth/verify-email' : '/api/auth/verify-phone';
        const payload = isEmail ? { email: newEmailOrPhone, otp } : { email: user.email, otp };

        try {
            const res = await axios.post(endpoint, payload, { headers: { 'x-auth-token': token } });
            if (res.status === 200) {
                setStatus({ message: 'Verification successful. Your information has been updated.', type: 'success' });
                setIsEmailModalOpen(false);
                setIsPhoneModalOpen(false);
                // In a real app, you would refetch the user data here to show the new value.
            }
        } catch (err) {
            console.error(err);
            setStatus({ message: 'Invalid OTP. Please try again.', type: 'error' });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const config = { headers: { 'x-auth-token': token } };
        
        try {
            const res = await axios.put('/api/auth/profile/personal', formData, config);
            setStatus({ message: res.data.msg, type: 'success' });
        } catch (err) {
            console.error(err);
            setStatus({ message: 'Failed to update personal info. Please try again.', type: 'error' });
        }
    };

    return (
        <FormContainer onSubmit={handleUpdate}>
            {status.message && <StatusMessage type={status.type}>{status.message}</StatusMessage>}
            
            <SectionTitle>Contact Info</SectionTitle>
            <FormGroup>
                <Label htmlFor="firstName">First Name</Label>
                <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="lastName">Last Name</Label>
                <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                {formData.email !== user.email && <Button onClick={handleEmailChange}>Change Email</Button>}
            </FormGroup>
            <FormGroup>
                <Label htmlFor="phone">Phone Number</Label>
                <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                {formData.phone !== user.phoneNumber && <Button onClick={handlePhoneChange}>Change Phone</Button>}
            </FormGroup>

            <SectionTitle>Billing Address</SectionTitle>
            <FormGroup>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input type="text" id="addressLine1" name="billingAddress.addressLine1" value={formData.billingAddress.addressLine1} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input type="text" id="addressLine2" name="billingAddress.addressLine2" value={formData.billingAddress.addressLine2} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="city">City</Label>
                <Input type="text" id="city" name="billingAddress.city" value={formData.billingAddress.city} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="state">State</Label>
                <Input type="text" id="state" name="billingAddress.state" value={formData.billingAddress.state} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input type="text" id="zipCode" name="billingAddress.zipCode" value={formData.billingAddress.zipCode} onChange={handleChange} />
            </FormGroup>
            
            <Button type="submit">Save Changes</Button>

            {/* Email OTP Modal */}
            <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)}>
                <h3>Verify Email</h3>
                <p>An OTP has been sent to {newEmailOrPhone}.</p>
                <Input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <Button onClick={() => handleOtpVerification(true)}>Verify</Button>
            </Modal>
            
            {/* Phone OTP Modal */}
            <Modal isOpen={isPhoneModalOpen} onClose={() => setIsPhoneModalOpen(false)}>
                <h3>Verify Phone Number</h3>
                <p>An OTP has been sent to {newEmailOrPhone}.</p>
                <Input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <Button onClick={() => handleOtpVerification(false)}>Verify</Button>
            </Modal>
        </FormContainer>
    );
};

export default PersonalInfo;