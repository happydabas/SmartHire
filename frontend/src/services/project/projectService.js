export const projectService = {
  getProjectsList: async (userId) => {
    if (!userId) return [];
    const key = `smarthire_projects_${userId}`;
    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  },

  createProject: async (userId, project) => {
    if (!userId) throw new Error('User ID is required');
    const key = `smarthire_projects_${userId}`;
    const list = await projectService.getProjectsList(userId);
    const newProject = {
      id: Date.now(),
      ...project,
      technologies_used: Array.isArray(project.technologies_used)
        ? project.technologies_used
        : typeof project.technologies_used === 'string'
        ? project.technologies_used.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };
    list.push(newProject);
    localStorage.setItem(key, JSON.stringify(list));
    return newProject;
  },

  updateProject: async (userId, projectId, project) => {
    if (!userId) throw new Error('User ID is required');
    const key = `smarthire_projects_${userId}`;
    const list = await projectService.getProjectsList(userId);
    const index = list.findIndex(p => p.id === Number(projectId));
    if (index === -1) throw new Error('Project not found');
    list[index] = {
      ...list[index],
      ...project,
      technologies_used: Array.isArray(project.technologies_used)
        ? project.technologies_used
        : typeof project.technologies_used === 'string'
        ? project.technologies_used.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };
    localStorage.setItem(key, JSON.stringify(list));
    return list[index];
  },

  deleteProject: async (userId, projectId) => {
    if (!userId) throw new Error('User ID is required');
    const key = `smarthire_projects_${userId}`;
    const list = await projectService.getProjectsList(userId);
    const filtered = list.filter(p => p.id !== Number(projectId));
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  }
};

export default projectService;
