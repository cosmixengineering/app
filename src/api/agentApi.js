import apiClient from './apiClient';

/**
 * Agent API Service
 * Maps to Postman 'Agent' folder
 */

// GET /api/v1/agents
export const getAgents = async (params = {}) => {
    return apiClient.get('/agents', { params });
};

// GET /api/v1/agents/top5
export const getTopAgents = async () => {
    return apiClient.get('/agents/top5');
};

// GET /api/v1/agents/:id
export const getAgentById = async (id) => {
    return apiClient.get(`/agents/${id}`);
};

// PUT /api/v1/agents/:id (Admin/Franchise update)
export const updateAgent = async (id, formData) => {
    return apiClient.put(`/agents/${id}`, formData);
};

// GET /api/v1/agents/me (Self profile for agent)
export const getAgentMe = async () => {
    return apiClient.get('/agents/me');
};

// PATCH /api/v1/agents/update-profile
export const updateAgentProfile = async (formData, headers = {}) => {
    return apiClient.patch('/agents/update-profile', formData, { headers });
};

// POST /api/v1/agents/:franchiseId/agents (Add agent to specific franchise)
export const addAgentToFranchise = async (franchiseId, formData) => {
    return apiClient.post(`/agents/${franchiseId}/agents`, formData);
};

// GET /api/v1/agents/:franchiseId/agents (Get agents for a specific franchise)
export const getAgentsByFranchise = async (franchiseId) => {
    return apiClient.get(`/agents/${franchiseId}/agents`);
};

// PATCH /api/v1/agents/:agentId/toggle-status
export const toggleAgentStatus = async (id) => {
    return apiClient.patch(`/agents/${id}/toggle-status`);
};

// DELETE /api/v1/agents/:id
export const deleteAgent = async (id) => {
    return apiClient.delete(`/agents/${id}`);
};

// PUT /api/v1/agents/:franchiseId/agents/:agentId
export const updateAgentInFranchise = async (franchiseId, agentId, formData) => {
    return apiClient.put(`/agents/${franchiseId}/agents/${agentId}`, formData);
};

// DELETE /api/v1/agents/:franchiseId/agents/:agentId
export const deleteAgentInFranchise = async (franchiseId, agentId) => {
    return apiClient.delete(`/agents/${franchiseId}/agents/${agentId}`);
};
