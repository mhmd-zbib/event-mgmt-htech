import type { Tag } from '../../events/types/events';
import { mockTags } from '../../events/services/mockData';
import { v4 as uuidv4 } from 'uuid';

interface TagsResponse {
  data: Tag[];
  pagination: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  sort: {
    sortBy: string;
    sortOrder: string;
  };
}

interface TagResponse {
  data: Tag;
}

interface TagFormData {
  name: string;
  description?: string;
}

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create a copy of mockTags that we can modify
let tagsData = [...mockTags];

// Helper function to get paginated tags
const getPaginatedTags = (page: number, size: number, search: string): TagsResponse => {
  let filteredTags = tagsData;
  
  // Apply search filter if provided
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTags = filteredTags.filter(tag => 
      tag.name.toLowerCase().includes(searchLower) || 
      (tag.description && tag.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Apply pagination
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedTags = filteredTags.slice(startIndex, endIndex);
  
  return {
    data: paginatedTags,
    pagination: {
      total: filteredTags.length,
      page,
      size,
      totalPages: Math.ceil(filteredTags.length / size),
      hasNext: endIndex < filteredTags.length,
      hasPrevious: page > 1
    },
    sort: {
      sortBy: "name",
      sortOrder: "asc"
    }
  };
};

const getTags = async (params = {}): Promise<TagsResponse> => {
  // Simulate API delay
  await delay(500);
  
  // Extract pagination parameters
  const { page = 1, size = 10, search = '' } = params as any;
  
  return getPaginatedTags(page, size, search);
};

const getTagById = async (tagId: string): Promise<TagResponse> => {
  // Simulate API delay
  await delay(300);
  
  const tag = tagsData.find(t => t.id === tagId);
  
  if (!tag) {
    throw new Error(`Tag with ID ${tagId} not found`);
  }
  
  return { data: tag };
};

const createTag = async (tagData: TagFormData): Promise<TagResponse> => {
  // Simulate API delay
  await delay(800);
  
  const newTag: Tag = {
    id: uuidv4(),
    name: tagData.name,
    description: tagData.description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "current-user"
  };
  
  tagsData.push(newTag);
  
  return { data: newTag };
};

const updateTag = async (tagId: string, tagData: TagFormData): Promise<TagResponse> => {
  // Simulate API delay
  await delay(800);
  
  const tagIndex = tagsData.findIndex(t => t.id === tagId);
  
  if (tagIndex === -1) {
    throw new Error(`Tag with ID ${tagId} not found`);
  }
  
  const updatedTag: Tag = {
    ...tagsData[tagIndex],
    name: tagData.name,
    description: tagData.description || tagsData[tagIndex].description,
    updatedAt: new Date().toISOString()
  };
  
  tagsData[tagIndex] = updatedTag;
  
  return { data: updatedTag };
};

const deleteTag = async (tagId: string): Promise<void> => {
  // Simulate API delay
  await delay(600);
  
  const tagIndex = tagsData.findIndex(t => t.id === tagId);
  
  if (tagIndex === -1) {
    throw new Error(`Tag with ID ${tagId} not found`);
  }
  
  tagsData.splice(tagIndex, 1);
};

// Event-tag association methods
const addTagsToEvent = async (eventId: string, tagIds: string[]): Promise<void> => {
  // Simulate API delay
  await delay(500);
  
  // In a real implementation, this would update the event with the new tags
  console.log(`Added tags ${tagIds.join(', ')} to event ${eventId}`);
};

const removeTagsFromEvent = async (eventId: string, tagIds: string[]): Promise<void> => {
  // Simulate API delay
  await delay(500);
  
  // In a real implementation, this would remove the tags from the event
  console.log(`Removed tags ${tagIds.join(', ')} from event ${eventId}`);
};

const getEventTags = async (eventId: string): Promise<TagsResponse> => {
  // Simulate API delay
  await delay(400);
  
  // For mock purposes, we'll just return some random tags
  const eventTags = tagsData.slice(0, 3);
  
  return {
    data: eventTags,
    pagination: {
      total: eventTags.length,
      page: 1,
      size: 10,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false
    },
    sort: {
      sortBy: "name",
      sortOrder: "asc"
    }
  };
};

export const tagsService = {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  addTagsToEvent,
  removeTagsFromEvent,
  getEventTags
};
