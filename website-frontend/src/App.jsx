import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import WhatsAppButton from './components/Common/WhatsAppButton';
import CallButton from './components/Common/CallButton';

import Home from './pages/Home/Home';
import Properties from './pages/Properties/Properties';
import PropertyDetails from './pages/Properties/PropertyDetails';
import Projects from './pages/Projects/Projects';
import ProjectDetails from './pages/Projects/ProjectDetails';
import Locations from './pages/Locations/Locations';
import LocationDetails from './pages/Locations/LocationDetails';
import Services from './pages/Services/Services';
import About from './pages/About/About';
import Files from './pages/Files/Files';
import Contact from './pages/Contact/Contact';
import Favorites from './pages/Favorites/Favorites';
import Compare from './pages/Compare/Compare';
import FAQ from './pages/FAQ/FAQ';

import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsConditions from './pages/Legal/TermsConditions';
import Disclaimer from './pages/Legal/Disclaimer';
import CookiePolicy from './pages/Legal/CookiePolicy';
import NotFound from './pages/NotFound/NotFound';

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <CallButton />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC WEBSITE ROUTES */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />
      <Route
        path="/properties"
        element={
          <PublicLayout>
            <Properties />
          </PublicLayout>
        }
      />
      <Route
        path="/properties/:slug"
        element={
          <PublicLayout>
            <PropertyDetails />
          </PublicLayout>
        }
      />
      <Route path="/projects" element={<Navigate to="/properties" replace />} />
      <Route path="/projects/:slug" element={<Navigate to="/properties" replace />} />
      <Route
        path="/locations"
        element={
          <PublicLayout>
            <Locations />
          </PublicLayout>
        }
      />
      <Route
        path="/locations/:slug"
        element={
          <PublicLayout>
            <LocationDetails />
          </PublicLayout>
        }
      />
      <Route
        path="/services"
        element={
          <PublicLayout>
            <Services />
          </PublicLayout>
        }
      />
      <Route
        path="/files"
        element={
          <PublicLayout>
            <Files />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />
      <Route
        path="/favorites"
        element={
          <PublicLayout>
            <Favorites />
          </PublicLayout>
        }
      />
      <Route
        path="/compare"
        element={
          <PublicLayout>
            <Compare />
          </PublicLayout>
        }
      />
      <Route
        path="/faq"
        element={
          <PublicLayout>
            <FAQ />
          </PublicLayout>
        }
      />

      {/* LEGAL PAGES */}
      <Route
        path="/privacy-policy"
        element={
          <PublicLayout>
            <PrivacyPolicy />
          </PublicLayout>
        }
      />
      <Route
        path="/terms-and-conditions"
        element={
          <PublicLayout>
            <TermsConditions />
          </PublicLayout>
        }
      />
      <Route
        path="/disclaimer"
        element={
          <PublicLayout>
            <Disclaimer />
          </PublicLayout>
        }
      />
      <Route
        path="/cookie-policy"
        element={
          <PublicLayout>
            <CookiePolicy />
          </PublicLayout>
        }
      />

      {/* 404 NOT FOUND */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
