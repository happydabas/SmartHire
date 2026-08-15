export const certificationService = {
  getCertificationsList: async (userId) => {
    if (!userId) return [];
    const key = `smarthire_certifications_${userId}`;
    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  },

  createCertification: async (userId, cert) => {
    if (!userId) throw new Error('User ID is required');
    const key = `smarthire_certifications_${userId}`;
    const list = await certificationService.getCertificationsList(userId);
    const newCert = {
      id: Date.now(),
      ...cert
    };
    list.push(newCert);
    localStorage.setItem(key, JSON.stringify(list));
    return newCert;
  },

  updateCertification: async (userId, certId, cert) => {
    if (!userId) throw new Error('User ID is required');
    const key = `smarthire_certifications_${userId}`;
    const list = await certificationService.getCertificationsList(userId);
    const index = list.findIndex(c => c.id === Number(certId));
    if (index === -1) throw new Error('Certification not found');
    list[index] = {
      ...list[index],
      ...cert
    };
    localStorage.setItem(key, JSON.stringify(list));
    return list[index];
  },

  deleteCertification: async (userId, certId) => {
    if (!userId) throw new Error('User ID is required');
    const key = `smarthire_certifications_${userId}`;
    const list = await certificationService.getCertificationsList(userId);
    const filtered = list.filter(c => c.id !== Number(certId));
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  }
};

export default certificationService;
