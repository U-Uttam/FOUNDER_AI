import type { Startup, LocationCompareResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  /**
   * Retrieves all processed startup ideas
   */
  async getStartups(): Promise<Startup[]> {
    const response = await fetch(`${API_BASE_URL}/startups/`);
    if (!response.ok) {
      throw new Error('Failed to fetch startups list.');
    }
    return response.json();
  },

  /**
   * Retrieves a specific startup by ID (for polling/detail rendering)
   */
  async getStartup(id: string): Promise<Startup> {
    const response = await fetch(`${API_BASE_URL}/startups/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch startup details for ID: ${id}`);
    }
    return response.json();
  },

  /**
   * Submits a new startup idea to trigger the LangGraph orchestration flow
   */
  async createStartup(idea: string, budget: number, location: string): Promise<Startup> {
    const response = await fetch(`${API_BASE_URL}/startups/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idea, budget, location }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to submit startup proposal.');
    }
    return response.json();
  },

  /**
   * Runs a side-by-side geospatial comparison between two locations
   */
  async compareLocations(
    location1: string,
    location2: string,
    businessType: string,
    budget: number
  ): Promise<LocationCompareResponse> {
    const response = await fetch(`${API_BASE_URL}/location/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location1,
        location2,
        business_type: businessType,
        budget,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to run location comparison.');
    }
    return response.json();
  },

  /**
   * Approves a startup validation report, transitioning status from PENDING_APPROVAL to COMPLETED
   */
  async approveStartup(id: string): Promise<Startup> {
    const response = await fetch(`${API_BASE_URL}/startups/${id}/approve`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to approve startup configuration.');
    }
    return response.json();
  },

  /**
   * Retries a FAILED startup workflow from scratch
   */
  async retryStartup(id: string): Promise<Startup> {
    const response = await fetch(`${API_BASE_URL}/startups/${id}/retry`, {
      method: 'POST',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to retry startup workflow.');
    }
    return response.json();
  },

  /**
   * Updates the primary location of the startup and restarts the workflow
   */
  async updateLocation(id: string, location: string): Promise<Startup> {
    const response = await fetch(`${API_BASE_URL}/startups/${id}/update-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update startup location.');
    }
    return response.json();
  },

  /**
   * Generates custom vector SVG logo concepts using Gemini AI + Logo Engine
   */
  async generateLogoSvg(
    companyName: string,
    businessType: string = '',
    idea: string = '',
    style: string = 'luxury'
  ): Promise<{ logo_svg: string | null; logo_concepts?: any[]; brand_design?: any }> {
    const response = await fetch(`${API_BASE_URL}/startups/generate-logo-svg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_name: companyName,
        business_type: businessType,
        idea,
        style,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate AI SVG logo');
    }
    return response.json();
  },

  /**
   * Persists the user's selected logo concept on the startup record
   */
  async selectLogoConcept(startupId: string, conceptId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/startups/${startupId}/branding/select-concept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ concept_id: conceptId }),
    });
    if (!response.ok) {
      throw new Error('Failed to select logo concept');
    }
    return response.json();
  },

  /**
   * Returns direct download URL for individual branding assets
   */
  getBrandingAssetUrl(
    startupId: string,
    format: 'svg' | 'png' | 'png_transparent' | 'favicon_svg' | 'favicon_png',
    concept: number = 0,
    size: number = 1024
  ): string {
    return `${API_BASE_URL}/startups/${startupId}/branding/asset?format=${format}&concept=${concept}&size=${size}`;
  },

  /**
   * Returns direct download URL for the FounderAI_Brand_Kit.zip package
   */
  getBrandKitZipUrl(startupId: string, concept: number = 0): string {
    return `${API_BASE_URL}/startups/${startupId}/download/brand_kit?concept=${concept}`;
  },

  /**
   * Deletes a startup analysis proposal
   */
  async deleteStartup(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/startups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete startup proposal.');
    }
  },

  /**
   * Returns the direct API download URL for a specific report category
   */
  getDownloadUrl(id: string, reportType: string): string {
    return `${API_BASE_URL}/startups/${id}/download/${reportType}`;
  }
};

