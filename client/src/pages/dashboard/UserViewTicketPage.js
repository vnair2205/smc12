// client/src/pages/dashboard/UserViewTicketPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import * as supportService from '../../services/supportService';
import Preloader from '../../components/common/Preloader';
import { format } from 'date-fns';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;
const TicketHeader = styled.div`
  margin-bottom: 2rem;
  h1 { margin: 0; }
  span { color: #888; }
`;
const Card = styled.div`
  background: #1e1e2d;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;
const CardTitle = styled.h3`
  margin-top: 0;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
`;
const ConversationThread = styled.div``;
const MessageBubble = styled.div`
  background: ${({ fromAdmin }) => fromAdmin ? '#3c3c54' : '#2a2a3e'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  p { margin: 0.5rem 0 0; }
`;

const UserViewTicketPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTicket = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log(`[DEBUG] Frontend: Fetching ticket with ID: ${ticketId}`);
            const { data } = await supportService.getTicketById(ticketId);
            setTicket(data);
        } catch (error) {
            // --- MODIFIED CATCH BLOCK ---
            console.error("!!! [ERROR] Frontend: Failed to fetch ticket.");
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("[DEBUG] Error data:", error.response.data);
                console.error("[DEBUG] Error status:", error.response.status);
                console.error("[DEBUG] Error headers:", error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("[DEBUG] No response received:", error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('[DEBUG] Error setting up request:', error.message);
            }
            // --- END MODIFIED CATCH BLOCK ---
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    if (isLoading) return <Preloader />;
    if (!ticket) return <PageContainer>Ticket not found or you do not have permission to view it.</PageContainer>;

    // Check if the current user is the author of the reply
    const isUserReplyAuthor = (reply) => {
        return reply.user._id === ticket.user._id;
    }

    return (
        <PageContainer>
            <TicketHeader>
                <h1>{ticket.subject}</h1>
                <span>Ticket #{ticket.ticketNumber} &bull; Status: {ticket.status}</span>
            </TicketHeader>
            <Card>
                <CardTitle>Conversation</CardTitle>
                <ConversationThread>
                    <MessageBubble fromAdmin={false}>
                        <strong>You</strong>
                        <p>{ticket.description}</p>
                        <small>{format(new Date(ticket.createdAt), 'PPp')}</small>
                        {/* Add logic to display user's initial attachments */}
                    </MessageBubble>
                    {ticket.conversation.map(reply => (
                        <MessageBubble key={reply._id} fromAdmin={!isUserReplyAuthor(reply)}>
                            <strong>{isUserReplyAuthor(reply) ? 'You' : `${reply.user.firstName} (Admin)`}</strong>
                            <p>{reply.message}</p>
                            <small>{format(new Date(reply.createdAt), 'PPp')}</small>
                            {/* Add logic to display reply attachments */}
                        </MessageBubble>
                    ))}
                </ConversationThread>
            </Card>
            <Link to="/dashboard/support-tickets">Back to My Tickets</Link>
        </PageContainer>
    );
};

export default UserViewTicketPage;