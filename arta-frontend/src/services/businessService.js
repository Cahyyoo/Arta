import api from "./api";

const businessService = {
  onboardingBusiness: async (data) => {
    return api.post("/api/profile/onboarding", data);
  },

  predictFeasibility: async (formData) => {
    return api.post("/api/feasibility-tests", formData);
  },

  getLatestFeasibility: async () => {
    return api.get("/api/feasibility-tests/latest");
  }
};

export default businessService;
