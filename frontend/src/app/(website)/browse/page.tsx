import React from 'react';
import BrowsePage from '@/components/Browse/BrowsePage';
import SiteHeader from '@/components/common/Headers/SiteHeader';

const Browse = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <BrowsePage />
    </div>
  );
};

export default Browse;