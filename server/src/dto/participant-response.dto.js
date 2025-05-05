/**
 * Participant Response DTOs
 * Responsible for structuring participant response data
 */

const { formatPaginatedResponse, formatItemResponse } = require('../utils/response-formatter');
const { mapEventForList } = require('./event-response.dto');

const mapParticipantForList = (participant) => ({
  id: participant.id,
  userId: participant.userId,
  registrationDate: participant.registrationDate,
  firstName: participant.user ? participant.user.firstName : null,
  lastName: participant.user ? participant.user.lastName : null,
  email: participant.user ? participant.user.email : null
});

const mapParticipatingEventForList = (participation) => ({
  id: participation.id,
  eventId: participation.eventId,
  status: participation.status,
  registrationDate: participation.registrationDate,
  event: participation.event ? {
    id: participation.event.id,
    title: participation.event.title,
    description: participation.event.description,
    location: participation.event.location,
    startDate: participation.event.startDate,
    endDate: participation.event.endDate,
    creator: participation.event.creator ? {
      id: participation.event.creator.id,
      firstName: participation.event.creator.firstName,
      lastName: participation.event.creator.lastName
    } : null
  } : null
});

/**
 * Maps a participation record to the standard event format used by the events endpoint
 * This ensures consistency between /events and /participants endpoints
 */
const mapParticipatingEventToEventFormat = (participation) => {
  if (!participation.event) return null;
  
  // Use the same mapping function as the events endpoint for consistency
  return mapEventForList(participation.event);
};

const createParticipantListResponseDto = (participants, pagination, sort) => {
  return formatPaginatedResponse(participants, pagination, sort, mapParticipantForList);
};

const createParticipantDetailResponseDto = (participant) => {
  // Using formatItemResponse which now returns the item directly
  return formatItemResponse(participant);
};

const createUserParticipatingEventsDto = (participations, pagination, sort) => {
  return formatPaginatedResponse(participations, pagination, sort, mapParticipatingEventForList);
};

const createUserParticipatingEventsAsEventsDto = (participations, pagination, sort) => {
  // Extract just the event object from each participation
  const events = participations
    .map(participation => participation.event)
    .filter(event => event !== null && event !== undefined);
  
  // Use the standard events response format
  return formatPaginatedResponse(events, pagination, sort, mapEventForList);
};

module.exports = {
  createParticipantListResponseDto,
  createParticipantDetailResponseDto,
  createUserParticipatingEventsDto,
  createUserParticipatingEventsAsEventsDto,
  mapParticipantForList
};