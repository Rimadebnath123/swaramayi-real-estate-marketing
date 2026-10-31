import { Router } from 'express';
import {
  getPublicProperties,
  getPublicFeaturedProperties,
  getPublicRecentProperties,
  getPublicSoldProperties,
  getPublicPropertyBySlug,
  getPublicProjects,
  getPublicProjectBySlug,
  submitPublicEnquiry,
  getPublicLocations,
  getPublicLocationBySlug,
  getPublicCities,
  getPublicSocieties,
  getPublicPhases,
  getPublicFiles,
  createPublicFile,
  updatePublicFile,
  deletePublicFile,
  getPublicAgents,
  submitPublicAdvisorRating,
  getPublicAdvisorRatings,
  createPublicAdvisorRatingInvite,
  clearPublicAdvisorRatings,
  deletePublicAdvisorRatingById
} from '../controllers/public.controller.js';

const router = Router();

// Public Property Endpoints (specific endpoints BEFORE :slug)
router.get('/properties', getPublicProperties);
router.get('/properties/featured', getPublicFeaturedProperties);
router.get('/properties/recent', getPublicRecentProperties);
router.get('/properties/sold', getPublicSoldProperties);
router.get('/properties/:slug', getPublicPropertyBySlug);

// Public Project Endpoints
router.get('/projects', getPublicProjects);
router.get('/projects/:slug', getPublicProjectBySlug);

// Public Enquiry & Site Visit & Advisor Rating Submissions
router.post('/enquiries', submitPublicEnquiry);
router.get('/advisor-rating', getPublicAdvisorRatings);
router.post('/advisor-rating', submitPublicAdvisorRating);
router.post('/advisor-rating/invite', createPublicAdvisorRatingInvite);
router.delete('/advisor-rating', clearPublicAdvisorRatings);
router.delete('/advisor-rating/:id', deletePublicAdvisorRatingById);

// Public Location listings (specific endpoints BEFORE :slug)
router.get('/locations', getPublicLocations);
router.get('/locations/cities', getPublicCities);
router.get('/locations/societies', getPublicSocieties);
router.get('/locations/phases', getPublicPhases);
router.get('/locations/:slug', getPublicLocationBySlug);

// Public File & Agent listings
router.get('/files', getPublicFiles);
router.post('/files', createPublicFile);
router.put('/files/:id', updatePublicFile);
router.delete('/files/:id', deletePublicFile);
router.get('/agents', getPublicAgents);

export default router;
