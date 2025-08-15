import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// --- Styled Components ---
const LearnsFormContainer = styled.form`
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

const TagContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const TagButton = styled.button`
    padding: 0.5rem 1rem;
    border: 1px solid ${({ theme }) => theme.colors.textSecondary};
    border-radius: 20px;
    background-color: ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
    color: ${({ active, theme }) => (active ? theme.colors.background : theme.colors.text)};
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${({ active, theme }) => (active ? theme.colors.primary : '#333')};
    }
`;

const RadioContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
`;

const RadioOption = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
`;

const RadioInput = styled.input`
    accent-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.2);
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

const LearnsProfile = ({ user }) => {
    const [learnsData, setLearnsData] = useState({
        learningGoals: [],
        experienceLevel: 'Beginner',
        areasOfInterest: [],
        resourceNeeds: [],
        newSkillTarget: []
    });
    const [status, setStatus] = useState({ message: '', type: '' });

    const learningGoalsOptions = ['Career Advancement', 'Career Change', 'Skill Development', 'Hobby'];
    const experienceLevelOptions = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];
    const areasOfInterestOptions = ['Technology', 'Business', 'Data Science', 'Art & Design', 'Marketing', 'Health'];
    const resourceNeedsOptions = ['Interactive Content', 'Video Lectures', 'Live Sessions', 'Quizzes & Assessments', 'Certification'];
    const newSkillTargetOptions = ['Python', 'Data Analysis', 'UI/UX Design', 'Cloud Computing', 'Digital Marketing'];

    useEffect(() => {
        if (user) {
            setLearnsData({
                learningGoals: user.learningGoals || [],
                experienceLevel: user.experienceLevel || 'Beginner',
                areasOfInterest: user.areasOfInterest || [],
                resourceNeeds: user.resourceNeeds || [],
                newSkillTarget: user.newSkillTarget || []
            });
        }
    }, [user]);

    const toggleTag = (category, tag) => {
        setLearnsData(prev => {
            const currentTags = prev[category];
            const isSelected = currentTags.includes(tag);
            return {
                ...prev,
                [category]: isSelected 
                    ? currentTags.filter(item => item !== tag)
                    : [...currentTags, tag]
            };
        });
    };

    const handleRadioChange = (e) => {
        setLearnsData(prev => ({
            ...prev,
            experienceLevel: e.target.value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const config = { headers: { 'x-auth-token': token } };

        try {
            const res = await axios.put('/api/auth/profile/learns', learnsData, config);
            setStatus({ message: res.data.msg, type: 'success' });
        } catch (err) {
            console.error(err);
            setStatus({ message: 'Failed to update LEARNS profile. Please try again.', type: 'error' });
        }
    };

    return (
        <LearnsFormContainer onSubmit={handleUpdate}>
            {status.message && <StatusMessage type={status.type}>{status.message}</StatusMessage>}
            
            <SectionTitle>Learning Goals</SectionTitle>
            <FormGroup>
                <Label>What are your primary goals for learning?</Label>
                <TagContainer>
                    {learningGoalsOptions.map(goal => (
                        <TagButton 
                            key={goal}
                            type="button"
                            active={learnsData.learningGoals.includes(goal)}
                            onClick={() => toggleTag('learningGoals', goal)}
                        >
                            {goal}
                        </TagButton>
                    ))}
                </TagContainer>
            </FormGroup>

            <SectionTitle>Experience Level</SectionTitle>
            <FormGroup>
                <Label>What is your experience level in your target area?</Label>
                <RadioContainer>
                    {experienceLevelOptions.map(level => (
                        <RadioOption key={level}>
                            <RadioInput
                                type="radio"
                                id={level}
                                name="experienceLevel"
                                value={level}
                                checked={learnsData.experienceLevel === level}
                                onChange={handleRadioChange}
                            />
                            <Label htmlFor={level}>{level}</Label>
                        </RadioOption>
                    ))}
                </RadioContainer>
            </FormGroup>

            <SectionTitle>Areas of Interest</SectionTitle>
            <FormGroup>
                <Label>Select your areas of interest:</Label>
                <TagContainer>
                    {areasOfInterestOptions.map(area => (
                        <TagButton 
                            key={area}
                            type="button"
                            active={learnsData.areasOfInterest.includes(area)}
                            onClick={() => toggleTag('areasOfInterest', area)}
                        >
                            {area}
                        </TagButton>
                    ))}
                </TagContainer>
            </FormGroup>

            <SectionTitle>Resource Needs</SectionTitle>
            <FormGroup>
                <Label>What types of resources help you learn best?</Label>
                <TagContainer>
                    {resourceNeedsOptions.map(resource => (
                        <TagButton 
                            key={resource}
                            type="button"
                            active={learnsData.resourceNeeds.includes(resource)}
                            onClick={() => toggleTag('resourceNeeds', resource)}
                        >
                            {resource}
                        </TagButton>
                    ))}
                </TagContainer>
            </FormGroup>
            
            <SectionTitle>New Skill Target</SectionTitle>
            <FormGroup>
                <Label>Are there specific skills you are looking to learn?</Label>
                <TagContainer>
                    {newSkillTargetOptions.map(skill => (
                        <TagButton 
                            key={skill}
                            type="button"
                            active={learnsData.newSkillTarget.includes(skill)}
                            onClick={() => toggleTag('newSkillTarget', skill)}
                        >
                            {skill}
                        </TagButton>
                    ))}
                </TagContainer>
            </FormGroup>
            
            <Button type="submit">Save LEARNS Profile</Button>
        </LearnsFormContainer>
    );
};

export default LearnsProfile;