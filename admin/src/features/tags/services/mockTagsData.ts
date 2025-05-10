import type { Tag } from '../../events/types/events';
import { v4 as uuidv4 } from 'uuid';

// Mock tags data
export const mockTags: Tag[] = [
  {
    id: "1",
    name: "Technology",
    description: "Technology related events",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
    createdBy: "user-1",
    creator: {
      id: "user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com"
    }
  },
  {
    id: "2",
    name: "Business",
    description: "Business and entrepreneurship events",
    createdAt: new Date(2023, 1, 20).toISOString(),
    updatedAt: new Date(2023, 1, 20).toISOString(),
    createdBy: "user-1",
    creator: {
      id: "user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com"
    }
  },
  {
    id: "3",
    name: "Design",
    description: "Design and UX/UI events",
    createdAt: new Date(2023, 2, 10).toISOString(),
    updatedAt: new Date(2023, 2, 10).toISOString(),
    createdBy: "user-2",
    creator: {
      id: "user-2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com"
    }
  },
  {
    id: "4",
    name: "Marketing",
    description: "Marketing and advertising events",
    createdAt: new Date(2023, 3, 5).toISOString(),
    updatedAt: new Date(2023, 3, 5).toISOString(),
    createdBy: "user-2",
    creator: {
      id: "user-2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com"
    }
  },
  {
    id: "5",
    name: "Development",
    description: "Software development events",
    createdAt: new Date(2023, 4, 12).toISOString(),
    updatedAt: new Date(2023, 4, 12).toISOString(),
    createdBy: "user-1",
    creator: {
      id: "user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com"
    }
  }
];

// Function to get all tags with pagination
export function getPaginatedTags(page = 1, size = 10, search = '') {
  let filteredTags = [...mockTags];
  
  // Apply search filter if provided
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTags = filteredTags.filter(tag => 
      tag.name.toLowerCase().includes(searchLower) || 
      (tag.description && tag.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Calculate pagination
  const total = filteredTags.length;
  const totalPages = Math.ceil(total / size);
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedTags = filteredTags.slice(startIndex, endIndex);
  
  return {
    data: paginatedTags,
    pagination: {
      total,
      page,
      size,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    },
    sort: {
      sortBy: "createdAt",
      sortOrder: "desc"
    }
  };
}

// Function to get a tag by ID
export function getTagById(id: string) {
  const tag = mockTags.find(tag => tag.id === id);
  if (!tag) {
    throw new Error(`Tag with ID ${id} not found`);
  }
  return { data: tag };
}

// Function to create a new tag
export function createTag(tagData: { name: string; description?: string }) {
  const newTag: Tag = {
    id: uuidv4(),
    name: tagData.name,
    description: tagData.description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "current-user",
    creator: {
      id: "current-user",
      firstName: "Current",
      lastName: "User",
      email: "current.user@example.com"
    }
  };
  
  mockTags.push(newTag);
  return { data: newTag };
}

// Function to update a tag
export function updateTag(id: string, tagData: { name: string; description?: string }) {
  const tagIndex = mockTags.findIndex(tag => tag.id === id);
  if (tagIndex === -1) {
    throw new Error(`Tag with ID ${id} not found`);
  }
  
  const updatedTag = {
    ...mockTags[tagIndex],
    name: tagData.name,
    description: tagData.description || mockTags[tagIndex].description,
    updatedAt: new Date().toISOString()
  };
  
  mockTags[tagIndex] = updatedTag;
  return { data: updatedTag };
}

// Function to delete a tag
export function deleteTag(id: string) {
  const tagIndex = mockTags.findIndex(tag => tag.id === id);
  if (tagIndex === -1) {
    throw new Error(`Tag with ID ${id} not found`);
  }
  
  mockTags.splice(tagIndex, 1);
}
